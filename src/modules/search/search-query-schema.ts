import { z } from 'zod'

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(200),
  translation: z.enum(['abuadel', 'kuliev', 'all']).default('kuliev'),
  mode: z.enum(['word', 'phrase', 'prefix']).default('word'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
