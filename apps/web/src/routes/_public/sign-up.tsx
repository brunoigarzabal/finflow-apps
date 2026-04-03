import { createFileRoute } from '@tanstack/react-router'

import { SignUpPage } from '@/modules/auth'

export const Route = createFileRoute('/_public/sign-up')({
  component: SignUpPage,
})
