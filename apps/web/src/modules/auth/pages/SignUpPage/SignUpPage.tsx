import { Wallet03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { SignUpForm } from './components/SignUpForm'

export const SignUpPage = () => (
  <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex items-center gap-2 self-center font-medium">
        <HugeiconsIcon icon={Wallet03Icon} className="size-6 text-primary" />
        Minhas Finanças
      </div>
      <SignUpForm />
    </div>
  </div>
)
