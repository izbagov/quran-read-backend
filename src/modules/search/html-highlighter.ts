import { TextNormalizer } from './text-normalizer'
import type { SearchMode } from './search.types'

const WORD_CHARACTER_CLASS = String.raw`[\p{L}\p{N}_]`

export class HtmlHighlighter {
  constructor(private readonly normalizer: TextNormalizer) {}

  highlight(text: string, query: string, mode: SearchMode): string {
    const matcher = this.createMatcher(query, mode)

    if (matcher === null) {
      return this.escapeHtml(text)
    }

    let result = ''
    let lastIndex = 0

    for (const match of text.matchAll(matcher)) {
      const matchText = match[0]
      const index = match.index ?? 0

      result += this.escapeHtml(text.slice(lastIndex, index))
      result += `<em>${this.escapeHtml(matchText)}</em>`
      lastIndex = index + matchText.length
    }

    result += this.escapeHtml(text.slice(lastIndex))
    return result
  }

  private createMatcher(query: string, mode: SearchMode): RegExp | null {
    const tokens = this.normalizer.tokenize(query)

    if (tokens.length === 0) {
      return null
    }

    if (mode === 'phrase') {
      return this.createPhraseMatcher(query)
    }

    const pattern = tokens
      .sort((left, right) => right.length - left.length)
      .map((token) => this.createRussianInsensitivePattern(token))
      .join('|')

    if (pattern.length === 0) {
      return null
    }

    const suffix = mode === 'prefix' ? `${WORD_CHARACTER_CLASS}*` : `(?!${WORD_CHARACTER_CLASS})`
    return new RegExp(`(?<!${WORD_CHARACTER_CLASS})(?:${pattern})${suffix}`, 'giu')
  }

  private createPhraseMatcher(query: string): RegExp | null {
    const phrase = this.normalizer.normalize(query)

    if (phrase.length === 0) {
      return null
    }

    const pattern = this.escapeRegExp(phrase)
      .replace(/е/gu, '[её]')
      .replace(/\s+/gu, String.raw`[^\p{L}\p{N}]+`)

    return new RegExp(pattern, 'giu')
  }

  private createRussianInsensitivePattern(token: string): string {
    return this.escapeRegExp(token).replace(/е/gu, '[её]')
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
}
