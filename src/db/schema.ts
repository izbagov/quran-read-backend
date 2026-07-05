import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const verseTranslations = sqliteTable(
  'verse_translations',
  {
    pk: integer('pk').primaryKey({ autoIncrement: true }),
    verseId: text('verse_id').notNull(),
    surahNumber: integer('surah_number').notNull(),
    ayahNumber: integer('ayah_number').notNull(),
    translator: text('translator').notNull(),
    text: text('text').notNull(),
    normalizedText: text('normalized_text').notNull(),
  },
  (table) => [
    uniqueIndex('idx_verse_translations_translator_verse').on(table.translator, table.verseId),
    index('idx_verse_translations_translator').on(table.translator),
    index('idx_verse_translations_location').on(table.surahNumber, table.ayahNumber),
  ],
)

export type VerseTranslation = typeof verseTranslations.$inferSelect
export type NewVerseTranslation = typeof verseTranslations.$inferInsert
