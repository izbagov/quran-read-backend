import type { TranslationCode } from '../../config/paths'

export type SearchMode = 'word' | 'phrase' | 'prefix'
export type TranslationQuery = TranslationCode | 'all'

export type SearchQuery = {
  q: string
  translation: TranslationQuery
  mode: SearchMode
  page: number
  limit: number
}

export type SearchRow = {
  id: string
  surahNumber: number
  ayahNumber: number
  translation: TranslationCode
  text: string
}

export type SearchResultItem = SearchRow & {
  textHighlighted: string
}

export type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type SearchResponse = {
  data: SearchResultItem[]
  pagination: Pagination
}
