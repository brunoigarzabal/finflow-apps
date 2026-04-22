import { createFileRoute } from '@tanstack/react-router'

import { SignUpPage } from '@/modules/auth'

export const Route = createFileRoute('/_public/sign-up')({
  head: () => ({
    meta: [{ title: 'Criar conta | FinFlow' }],
  }),
  component: SignUpPage,
})
