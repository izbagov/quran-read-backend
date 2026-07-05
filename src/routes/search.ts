import { type FastifyPluginAsync } from 'fastify'
import { EmptySearchQueryError } from '../modules/search/search-query-builder'
import { searchQuerySchema } from '../modules/search/search-query-schema'
import { closeSearchDatabase, getSearchService } from '../modules/search/search-container'

const search: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.addHook('onClose', async () => {
    closeSearchDatabase()
  })

  fastify.get('/search', async function (request, reply) {
    const parsed = searchQuerySchema.safeParse(request.query)

    if (!parsed.success) {
      return reply.badRequest(parsed.error.message)
    }

    try {
      return getSearchService().search(parsed.data)
    } catch (error) {
      if (error instanceof EmptySearchQueryError) {
        return reply.badRequest(error.message)
      }

      throw error
    }
  })
}

export default search
