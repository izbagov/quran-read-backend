import { HtmlHighlighter } from './html-highlighter'
import { SearchQueryBuilder } from './search-query-builder'
import type { Pagination, SearchQuery, SearchResponse } from './search.types'
import { TranslationRepository } from './translation-repository'

export class SearchService {
  constructor(
    private readonly repository: TranslationRepository,
    private readonly queryBuilder: SearchQueryBuilder,
    private readonly highlighter: HtmlHighlighter,
  ) {}

  search(query: SearchQuery): SearchResponse {
    const ftsQuery = this.queryBuilder.build(query.q, query.mode)
    const total = this.repository.count(query.translation, ftsQuery)
    const rows = this.repository.search(query, ftsQuery)

    return {
      data: rows.map((row) => ({
        ...row,
        textHighlighted: this.highlighter.highlight(row.text, query.q, query.mode),
      })),
      pagination: this.createPagination(query.page, query.limit, total),
    }
  }

  private createPagination(page: number, limit: number, total: number): Pagination {
    const totalPages = Math.ceil(total / limit)

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1 && totalPages > 0,
    }
  }
}
