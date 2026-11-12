import { categoryType } from '@/modules/category/schemas.js'
import { categoryRepository } from '@/shared/database/repositories/category.repository.js'

import {
  READ_ONLY_ANNOTATIONS,
  toolHandler,
  type ToolContext,
} from '../helpers/tool-context.js'

const NAME = 'list_categories'

export function registerListCategoriesTool(ctx: ToolContext) {
  ctx.server.registerTool(
    NAME,
    {
      title: 'Listar categorias',
      description:
        'Categorias de receita e despesa ativas. Use os ids para filtrar list_transactions.',
      inputSchema: {
        type: categoryType
          .optional()
          .describe('INCOME ou EXPENSE. Omitir para ambas'),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    toolHandler(ctx, NAME, async ({ type }) => {
      const categories = await categoryRepository(ctx.prisma).findMany(
        ctx.userId,
        { type, archived: false }
      )

      return {
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          type: category.type,
        })),
      }
    })
  )
}
