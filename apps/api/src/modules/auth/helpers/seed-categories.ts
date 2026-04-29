import type {
  CategoryType,
  Prisma,
  PrismaClient,
} from '../../../../generated/prisma/client.js'

import { categoryRepository } from '@/shared/database/repositories/category.repository.js'

type TransactionClient = Prisma.TransactionClient

const DEFAULT_CATEGORIES: {
  name: string
  type: CategoryType
  color: string
  icon: string
  slug?: string
}[] = [
  // Expense
  {
    name: 'Alimentação',
    type: 'EXPENSE',
    color: '#EC5CA8',
    icon: 'restaurant-01',
  },
  {
    name: 'Assinaturas e serviços',
    type: 'EXPENSE',
    color: '#6558D9',
    icon: 'invoice-01',
  },
  {
    name: 'Bares e restaurantes',
    type: 'EXPENSE',
    color: '#3F35C9',
    icon: 'restaurant-01',
  },
  { name: 'Casa', type: 'EXPENSE', color: '#5AA8FF', icon: 'home-01' },
  {
    name: 'Compras',
    type: 'EXPENSE',
    color: '#C3408B',
    icon: 'shopping-bag-01',
  },
  {
    name: 'Cuidados pessoais',
    type: 'EXPENSE',
    color: '#FF6B73',
    icon: 'heart-check',
  },
  {
    name: 'Dívidas e empréstimos',
    type: 'EXPENSE',
    color: '#FFA0A0',
    icon: 'money-bag-01',
  },
  {
    name: 'Educação',
    type: 'EXPENSE',
    color: '#3456CF',
    icon: 'graduation-scroll',
  },
  {
    name: 'Família e filhos',
    type: 'EXPENSE',
    color: '#63DC7A',
    icon: 'home-01',
  },
  { name: 'Impostos e Taxas', type: 'EXPENSE', color: '#FFC1B5', icon: 'bank' },
  {
    name: 'Investimentos',
    type: 'EXPENSE',
    color: '#F48BCB',
    icon: 'chart-bar-01',
  },
  {
    name: 'Lazer e hobbies',
    type: 'EXPENSE',
    color: '#3C9B4A',
    icon: 'game-controller-01',
  },
  {
    name: 'Mercado',
    type: 'EXPENSE',
    color: '#F48B5E',
    icon: 'shopping-cart-01',
  },
  {
    name: 'Outros',
    type: 'EXPENSE',
    color: '#B0B4B8',
    icon: 'coin',
    slug: 'other',
  },
  { name: 'Pets', type: 'EXPENSE', color: '#F5A623', icon: 'heart-check' },
  {
    name: 'Presentes e doações',
    type: 'EXPENSE',
    color: '#3654CF',
    icon: 'gift',
  },
  { name: 'Roupas', type: 'EXPENSE', color: '#B73A05', icon: 'clothes' },
  { name: 'Saúde', type: 'EXPENSE', color: '#5AA8FF', icon: 'hospital-01' },
  { name: 'Trabalho', type: 'EXPENSE', color: '#3B56D3', icon: 'briefcase-01' },
  { name: 'Transporte', type: 'EXPENSE', color: '#7AB5FF', icon: 'bus-01' },
  { name: 'Viagem', type: 'EXPENSE', color: '#FF656D', icon: 'airplane-01' },

  // Income
  {
    name: 'Empréstimos',
    type: 'INCOME',
    color: '#2ED3B7',
    icon: 'money-bag-01',
  },
  {
    name: 'Investimentos',
    type: 'INCOME',
    color: '#0F6B5F',
    icon: 'chart-bar-01',
  },
  {
    name: 'Outras receitas',
    type: 'INCOME',
    color: '#78E6D0',
    icon: 'coin',
    slug: 'other',
  },
  { name: 'Salário', type: 'INCOME', color: '#36D6B7', icon: 'savings' },
]

export async function seedCategories(
  prisma: PrismaClient | TransactionClient,
  userId: string
) {
  const repo = categoryRepository(prisma)
  await repo.createMany(
    DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      isDefault: true,
      userId,
    }))
  )
}
