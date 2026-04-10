import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import {
  createBankAccountBody,
  updateBankAccountBody,
  listBankAccountsQuery,
  bankAccountIdParam,
  bankAccountResponse,
  bankAccountListResponse,
} from './bank-account.schemas.js'
import {
  listBankAccounts,
  getBankAccount,
  createBankAccount,
  updateBankAccount,
  archiveBankAccount,
  restoreBankAccount,
} from './bank-account.service.js'

export async function bankAccountRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  typedApp.get(
    '/',
    {
      schema: {
        tags: ['Bank Accounts'],
        summary: 'List bank accounts',
        security: [{ bearer: [] }],
        querystring: listBankAccountsQuery,
        response: { 200: bankAccountListResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const bankAccounts = await listBankAccounts(
        app.prisma,
        userId,
        request.query.archived,
      )
      return { bankAccounts }
    },
  )

  typedApp.get(
    '/:id',
    {
      schema: {
        tags: ['Bank Accounts'],
        summary: 'Get a bank account by ID',
        security: [{ bearer: [] }],
        params: bankAccountIdParam,
        response: { 200: bankAccountResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      return getBankAccount(app.prisma, userId, request.params.id)
    },
  )

  typedApp.post(
    '/',
    {
      schema: {
        tags: ['Bank Accounts'],
        summary: 'Create a bank account',
        security: [{ bearer: [] }],
        body: createBankAccountBody,
        response: { 201: bankAccountResponse },
      },
    },
    async (request, reply) => {
      const userId = await request.getCurrentUserId()
      const account = await createBankAccount(app.prisma, userId, request.body)
      return reply.status(201).send(account)
    },
  )

  typedApp.patch(
    '/:id',
    {
      schema: {
        tags: ['Bank Accounts'],
        summary: 'Update a bank account',
        security: [{ bearer: [] }],
        params: bankAccountIdParam,
        body: updateBankAccountBody,
        response: { 200: bankAccountResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      return updateBankAccount(
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
        tags: ['Bank Accounts'],
        summary: 'Archive a bank account',
        security: [{ bearer: [] }],
        params: bankAccountIdParam,
      },
    },
    async (request, reply) => {
      const userId = await request.getCurrentUserId()
      await archiveBankAccount(app.prisma, userId, request.params.id)
      return reply.status(204).send()
    },
  )

  typedApp.patch(
    '/:id/restore',
    {
      schema: {
        tags: ['Bank Accounts'],
        summary: 'Restore an archived bank account',
        security: [{ bearer: [] }],
        params: bankAccountIdParam,
        response: { 200: bankAccountResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      return restoreBankAccount(app.prisma, userId, request.params.id)
    },
  )
}
