import { AppLogo } from '@/components/common/AppLogo'

import { SignInForm } from './components/SignInForm'

export const SignInPage = () => (
  <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex items-center gap-2 self-center font-medium">
        <AppLogo />
        Minhas Finanças
      </div>
      <SignInForm />
    </div>
  </div>
)
