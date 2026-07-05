import type { Database } from 'better-sqlite3'
import type { NewVerseTranslation } from '../../db/schema'
import type { SearchQuery, SearchRow, TranslationQuery } from './search.types'

type CountRow = {
  total: number
}

export class TranslationRepository {
  constructor(private readonly sqlite: Database) {}

  upsertMany(translations: NewVerseTranslation[]): void {
    const insert = this.sqlite.prepare(`
      INSERT INTO verse_translations (
        verse_id,
        surah_number,
        ayah_number,
        translator,
        text,
        normalized_text
      )
      VALUES (
        @verseId,
        @surahNumber,
        @ayahNumber,
        @translator,
        @text,
        @normalizedText
      )
      ON CONFLICT(translator, verse_id) DO UPDATE SET
        surah_number = excluded.surah_number,
        ayah_number = excluded.ayah_number,
        text = excluded.text,
        normalized_text = excluded.normalized_text
    `)

    const transaction = this.sqlite.transaction((rows: NewVerseTranslation[]) => {
      for (const row of rows) {
        insert.run(row)
      }
    })

    transaction(translations)
  }

  rebuildSearchIndex(): void {
    this.sqlite.exec("INSERT INTO verse_translations_fts(verse_translations_fts) VALUES ('rebuild')")
  }

  search(query: SearchQuery, ftsQuery: string): SearchRow[] {
    const offset = (query.page - 1) * query.limit

    return this.sqlite
      .prepare(
        `
          SELECT
            vt.verse_id AS id,
            vt.surah_number AS surahNumber,
            vt.ayah_number AS ayahNumber,
            vt.translator AS translation,
            vt.text AS text
          FROM verse_translations_fts
          JOIN verse_translations vt ON vt.pk = verse_translations_fts.rowid
          WHERE verse_translations_fts MATCH @ftsQuery
            AND (@translation = 'all' OR vt.translator = @translation)
          ORDER BY bm25(verse_translations_fts), vt.surah_number, vt.ayah_number, vt.translator
          LIMIT @limit
          OFFSET @offset
        `,
      )
      .all({
        ftsQuery,
        translation: query.translation,
        limit: query.limit,
        offset,
      }) as SearchRow[]
  }

  count(translation: TranslationQuery, ftsQuery: string): number {
    const row = this.sqlite
      .prepare(
        `
          SELECT COUNT(*) AS total
          FROM verse_translations_fts
          JOIN verse_translations vt ON vt.pk = verse_translations_fts.rowid
          WHERE verse_translations_fts MATCH @ftsQuery
            AND (@translation = 'all' OR vt.translator = @translation)
        `,
      )
      .get({
        ftsQuery,
        translation,
      }) as CountRow

    return row.total
  }
}
