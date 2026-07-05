export class TextNormalizer {
  normalize(value: string): string {
    return value
      .normalize('NFKD')
      .replace(/ё/giu, 'е')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim()
      .replace(/\s+/g, ' ')
  }

  tokenize(value: string): string[] {
    const normalized = this.normalize(value)

    if (normalized.length === 0) {
      return []
    }

    return normalized.split(' ')
  }
}
