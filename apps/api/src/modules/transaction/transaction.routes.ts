import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import {
  createTransactionBody,
  updateTransactionBody,
  listTransactionsQuery,
  summaryQuery,
  summaryByCategoryQuery,
  summaryByPeriodQuery,
  balanceOverTimeQuery,
  transactionIdParam,
  transactionResponse,
  transactionDetailResponse,
  transactionListResponse,
  summaryResponse,
  summaryByCategoryResponse,
  summaryByPeriodResponse,
  balanceOverTimeResponse,
} from './transaction.schemas.js'
import {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getSummaryByCategory,
  getSummaryByPeriod,
  getBalanceOverTime,
} from './transaction.service.js'

export async function transactionRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  typedApp.get(
    '/summary',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Get transaction summary',
        security: [{ bearer: [] }],
        querystring: summaryQuery,
        response: { 200: summaryResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      return getSummary(app.prisma, userId, request.query)
    },
  )

  typedApp.get(
    '/summary-by-category',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Get transaction summary grouped by category',
        security: [{ bearer: [] }],
        querystring: summaryByCategoryQuery,
        response: { 200: summaryByCategoryResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      return getSummaryByCategory(app.prisma, userId, request.query)
    },
  )

  typedApp.get(
    '/summary-by-period',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Get transaction summary grouped by month',
        security: [{ bearer: [] }],
        querystring: summaryByPeriodQuery,
        response: { 200: summaryByPeriodResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      return getSummaryByPeriod(app.prisma, userId, request.query)
    },
  )

  typedApp.get(
    '/balance-over-time',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Get daily balance evolution over a period',
        security: [{ bearer: [] }],
        querystring: balanceOverTimeQuery,
        response: { 200: balanceOverTimeResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      return getBalanceOverTime(app.prisma, userId, request.query)
    },
  )

  typedApp.get(
    '/',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'List transactions',
        security: [{ bearer: [] }],
        querystring: listTransactionsQuery,
        response: { 200: transactionListResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      return listTransactions(app.prisma, userId, request.query)
    },
  )

  typedApp.get(
    '/:id',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Get a transaction by ID',
        security: [{ bearer: [] }],
        params: transactionIdParam,
        response: { 200: transactionDetailResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      return getTransaction(app.prisma, userId, request.params.id)
    },
  )

  typedApp.post(
    '/',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Create a transaction',
        security: [{ bearer: [] }],
        body: createTransactionBody,
        response: { 201: transactionDetailResponse },
      },
    },
    async (request, reply) => {
      const userId = await request.getCurrentUserId()
      const transaction = await createTransaction(
        app.prisma,
        userId,
        request.body,
      )
      return reply.status(201).send(transaction)
    },
  )

  typedApp.patch(
    '/:id',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Update a transaction',
        security: [{ bearer: [] }],
        params: transactionIdParam,
        body: updateTransactionBody,
        response: { 200: transactionResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      return updateTransaction(
        app.prisma,
        userId,
        request.params.id,
        request.body,
      )
    },
  )

  typedApp.delete(
    '/:id',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Delete a transaction',
        security: [{ bearer: [] }],
        params: transactionIdParam,
      },
    },
    async (request, reply) => {
      const userId = await request.getCurrentUserId()
      await deleteTransaction(app.prisma, userId, request.params.id)
      return reply.status(204).send()
    },
  )
}
