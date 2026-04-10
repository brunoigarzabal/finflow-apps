import type {
  CategoryType,
  Prisma,
  PrismaClient,
} from '../../../generated/prisma/client.js'

type TransactionClient = Prisma.TransactionClient

const DEFAULT_CATEGORIES: {
  name: string
  type: CategoryType
  color: string
  icon: string
}[] = [
  // Expense
  { name: 'Alimentação', type: 'EXPENSE', color: '#ef4444', icon: 'restaurant-01' },
  { name: 'Transporte', type: 'EXPENSE', color: '#f97316', icon: 'car-01' },
  { name: 'Moradia', type: 'EXPENSE', color: '#8b5cf6', icon: 'house-01' },
  { name: 'Saúde', type: 'EXPENSE', color: '#10b981', icon: 'heartbeat' },
  { name: 'Educação', type: 'EXPENSE', color: '#3b82f6', icon: 'graduation-scroll' },
  { name: 'Lazer', type: 'EXPENSE', color: '#ec4899', icon: 'game-controller' },
  { name: 'Vestuário', type: 'EXPENSE', color: '#f59e0b', icon: 't-shirt' },
  { name: 'Assinaturas', type: 'EXPENSE', color: '#6366f1', icon: 'repeat' },
  { name: 'Compras', type: 'EXPENSE', color: '#14b8a6', icon: 'shopping-bag-02' },
  { name: 'Pets', type: 'EXPENSE', color: '#a855f7', icon: 'dog' },
  { name: 'Impostos', type: 'EXPENSE', color: '#64748b', icon: 'bank' },
  { name: 'Outras despesas', type: 'EXPENSE', color: '#94a3b8', icon: 'minus-sign-circle' },

  // Income
  { name: 'Salário', type: 'INCOME', color: '#22c55e', icon: 'money-receive-02' },
  { name: 'Investimentos', type: 'INCOME', color: '#8b5cf6', icon: 'chart-line-data-01' },
  { name: 'Presentes', type: 'INCOME', color: '#f43f5e', icon: 'gift' },
  { name: 'Outras receitas', type: 'INCOME', color: '#94a3b8', icon: 'plus-sign-circle' },
]

export async function seedCategories(
  prisma: PrismaClient | TransactionClient,
  userId: string,
) {
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      isDefault: true,
      userId,
    })),
    skipDuplicates: true,
  })
}
