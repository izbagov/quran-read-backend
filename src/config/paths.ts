import { join } from 'node:path'

const projectRoot = process.cwd()
const translationsDirectory = join(projectRoot, 'src', 'data', 'verse-translations')

export const databasePath = process.env.QURAN_DATABASE_PATH ?? join(projectRoot, 'data', 'quran.sqlite')

export type TranslationCode = 'abuadel' | 'kuliev'

export type TranslationSource = {
  code: TranslationCode
  path: string
}

export const translationSources: TranslationSource[] = [
  {
    code: 'abuadel',
    path: process.env.ABUADEL_TRANSLATION_PATH ?? join(translationsDirectory, 'abuadel.json'),
  },
  {
    code: 'kuliev',
    path: process.env.KULIEV_TRANSLATION_PATH ?? join(translationsDirectory, 'kuliev.json'),
  },
]
