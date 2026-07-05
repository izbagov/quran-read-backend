import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

export class SqliteDatabase {
  private readonly sqlite: Database.Database
  private readonly orm: BetterSQLite3Database<typeof schema>

  constructor(filePath: string) {
    mkdirSync(dirname(filePath), { recursive: true })
    this.sqlite = new Database(filePath)
    this.orm = drizzle(this.sqlite, { schema })
    this.configure()
    this.migrate()
  }

  get raw(): Database.Database {
    return this.sqlite
  }

  get db(): BetterSQLite3Database<typeof schema> {
    return this.orm
  }

  close(): void {
    this.sqlite.close()
  }

  private configure(): void {
    this.sqlite.pragma('journal_mode = WAL')
    this.sqlite.pragma('foreign_keys = ON')
  }

  private migrate(): void {
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS verse_translations (
        pk INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_id TEXT NOT NULL,
        surah_number INTEGER NOT NULL,
        ayah_number INTEGER NOT NULL,
        translator TEXT NOT NULL,
        text TEXT NOT NULL,
        normalized_text TEXT NOT NULL,
        UNIQUE(translator, verse_id)
      );

      CREATE INDEX IF NOT EXISTS idx_verse_translations_translator
        ON verse_translations(translator);

      CREATE INDEX IF NOT EXISTS idx_verse_translations_location
        ON verse_translations(surah_number, ayah_number);

      CREATE VIRTUAL TABLE IF NOT EXISTS verse_translations_fts
        USING fts5(
          normalized_text,
          content='verse_translations',
          content_rowid='pk',
          tokenize='unicode61 remove_diacritics 2'
        );

      CREATE TRIGGER IF NOT EXISTS verse_translations_ai
        AFTER INSERT ON verse_translations
        BEGIN
          INSERT INTO verse_translations_fts(rowid, normalized_text)
          VALUES (new.pk, new.normalized_text);
        END;

      CREATE TRIGGER IF NOT EXISTS verse_translations_ad
        AFTER DELETE ON verse_translations
        BEGIN
          INSERT INTO verse_translations_fts(verse_translations_fts, rowid, normalized_text)
          VALUES ('delete', old.pk, old.normalized_text);
        END;

      CREATE TRIGGER IF NOT EXISTS verse_translations_au
        AFTER UPDATE ON verse_translations
        BEGIN
          INSERT INTO verse_translations_fts(verse_translations_fts, rowid, normalized_text)
          VALUES ('delete', old.pk, old.normalized_text);

          INSERT INTO verse_translations_fts(rowid, normalized_text)
          VALUES (new.pk, new.normalized_text);
        END;
    `)
  }
}
