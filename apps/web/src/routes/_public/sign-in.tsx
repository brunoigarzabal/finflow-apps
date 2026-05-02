import { createFileRoute } from '@tanstack/react-router'

import { SignInPage } from '@/modules/auth'

export const Route = createFileRoute('/_public/sign-in')({
  head: () => ({
    meta: [{ title: 'Entrar | Minhas Finanças' }],
  }),
  component: SignInPage,
})
