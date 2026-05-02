import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'

import { AppLogo } from '@/components/common/AppLogo'

export const NotFound = () => (
  <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
    <div className="flex flex-col items-center gap-6 text-center">
      <AppLogo className="size-10" />
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="text-muted-foreground">Página não encontrada</p>
      </div>
      <Button render={<Link to="/" />}>Voltar ao início</Button>
    </div>
  </div>
)
