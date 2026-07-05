import { databasePath, translationSources } from '../config/paths'
import { SqliteDatabase } from '../db/sqlite-database'
import { TranslationImporter } from '../modules/import/translation-importer'
import { TextNormalizer } from '../modules/search/text-normalizer'
import { TranslationRepository } from '../modules/search/translation-repository'

const database = new SqliteDatabase(databasePath)

try {
  const repository = new TranslationRepository(database.raw)
  const importer = new TranslationImporter(repository, new TextNormalizer())
  const summaries = importer.importSources(translationSources)

  for (const summary of summaries) {
    console.log(`${summary.translator}: imported ${summary.imported} verses`)
  }

  console.log(`Database: ${databasePath}`)
} finally {
  database.close()
}
