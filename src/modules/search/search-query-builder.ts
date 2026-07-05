import type { SearchMode } from './search.types'
import { TextNormalizer } from './text-normalizer'

export class EmptySearchQueryError extends Error {
  constructor() {
    super('Search query must contain at least one searchable token')
  }
}

export class SearchQueryBuilder {
  constructor(private readonly normalizer: TextNormalizer) {}

  build(query: string, mode: SearchMode): string {
    const tokens = this.normalizer.tokenize(query)

    if (tokens.length === 0) {
      throw new EmptySearchQueryError()
    }

    if (mode === 'phrase') {
      return `"${this.escapePhrase(tokens.join(' '))}"`
    }

    return tokens.map((token) => this.formatToken(token, mode)).join(' ')
  }

  private formatToken(token: string, mode: SearchMode): string {
    const escaped = this.escapeToken(token)
    return mode === 'prefix' ? `${escaped}*` : escaped
  }

  private escapeToken(token: string): string {
    return token.replace(/"/g, '""')
  }

  private escapePhrase(phrase: string): string {
    return phrase.replace(/"/g, '""')
  }
}
