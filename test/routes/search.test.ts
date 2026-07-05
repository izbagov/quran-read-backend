import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import assert from 'node:assert'
import { test } from 'node:test'
import { build } from '../helper'
import { SqliteDatabase } from '../../src/db/sqlite-database'
import { TextNormalizer } from '../../src/modules/search/text-normalizer'
import { TranslationRepository } from '../../src/modules/search/translation-repository'

test('search returns highlighted verse translations', async (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'quran-search-'))
  const databasePath = join(directory, 'quran.sqlite')
  process.env.QURAN_DATABASE_PATH = databasePath

  const database = new SqliteDatabase(databasePath)
  const normalizer = new TextNormalizer()
  const repository = new TranslationRepository(database.raw)

  repository.upsertMany([
    {
      verseId: '10:10',
      surahNumber: 10,
      ayahNumber: 10,
      translator: 'kuliev',
      text: 'Там их приветствием будет слово: «Мир!».',
      normalizedText: normalizer.normalize('Там их приветствием будет слово: «Мир!».'),
    },
    {
      verseId: '1:2',
      surahNumber: 1,
      ayahNumber: 2,
      translator: 'abuadel',
      text: 'Хвала Аллаху, Господу миров.',
      normalizedText: normalizer.normalize('Хвала Аллаху, Господу миров.'),
    },
  ])
  repository.rebuildSearchIndex()
  database.close()

  const app = await build(t)
  const response = await app.inject({
    method: 'GET',
    url: '/search?q=%D0%BC%D0%B8%D1%80&translation=kuliev&limit=10',
  })

  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.json(), {
    data: [
      {
        id: '10:10',
        surahNumber: 10,
        ayahNumber: 10,
        translation: 'kuliev',
        text: 'Там их приветствием будет слово: «Мир!».',
        textHighlighted: 'Там их приветствием будет слово: «<em>Мир</em>!».',
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  })
})
