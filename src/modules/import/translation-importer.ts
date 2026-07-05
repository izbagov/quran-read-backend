import { readFileSync } from 'node:fs'
import type { TranslationSource } from '../../config/paths'
import type { NewVerseTranslation } from '../../db/schema'
import { TextNormalizer } from '../search/text-normalizer'
import { TranslationRepository } from '../search/translation-repository'

type TranslationJson = Record<string, { text?: unknown }>

export type ImportSummary = {
  translator: string
  imported: number
}

export class TranslationImporter {
  constructor(
    private readonly repository: TranslationRepository,
    private readonly normalizer: TextNormalizer,
  ) {}

  importSources(sources: TranslationSource[]): ImportSummary[] {
    const summaries = sources.map((source) => this.importSource(source))
    this.repository.rebuildSearchIndex()
    return summaries
  }

  private importSource(source: TranslationSource): ImportSummary {
    const rows = this.readSource(source)
    this.repository.upsertMany(rows)

    return {
      translator: source.code,
      imported: rows.length,
    }
  }

  private readSource(source: TranslationSource): NewVerseTranslation[] {
    const content = readFileSync(source.path, 'utf8')
    const data = JSON.parse(content) as TranslationJson

    return Object.entries(data).map(([verseId, value]) => {
      if (typeof value.text !== 'string') {
        throw new Error(`Verse ${verseId} in ${source.path} does not contain a text field`)
      }

      const [surahNumber, ayahNumber] = this.parseVerseId(verseId, source.path)

      return {
        verseId,
        surahNumber,
        ayahNumber,
        translator: source.code,
        text: value.text,
        normalizedText: this.normalizer.normalize(value.text),
      }
    })
  }

  private parseVerseId(verseId: string, sourcePath: string): [number, number] {
    const match = /^(\d+):(\d+)$/.exec(verseId)

    if (match === null) {
      throw new Error(`Invalid verse id "${verseId}" in ${sourcePath}`)
    }

    return [Number(match[1]), Number(match[2])]
  }
}
