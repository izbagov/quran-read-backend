import { databasePath } from '../../config/paths'
import { SqliteDatabase } from '../../db/sqlite-database'
import { HtmlHighlighter } from './html-highlighter'
import { SearchQueryBuilder } from './search-query-builder'
import { SearchService } from './search-service'
import { TextNormalizer } from './text-normalizer'
import { TranslationRepository } from './translation-repository'

let service: SearchService | null = null
let database: SqliteDatabase | null = null

export function getSearchService(): SearchService {
  if (service === null) {
    database = new SqliteDatabase(databasePath)

    const normalizer = new TextNormalizer()
    const repository = new TranslationRepository(database.raw)
    const queryBuilder = new SearchQueryBuilder(normalizer)
    const highlighter = new HtmlHighlighter(normalizer)

    service = new SearchService(repository, queryBuilder, highlighter)
  }

  return service
}

export function closeSearchDatabase(): void {
  database?.close()
  database = null
  service = null
}
