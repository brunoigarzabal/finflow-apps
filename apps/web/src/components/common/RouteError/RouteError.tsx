import { useRouter } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'

import { AppLogo } from '@/components/common/AppLogo'

export const RouteError = () => {
  const router = useRouter()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex flex-col items-center gap-6 text-center">
        <AppLogo className="size-10" />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Algo deu errado</h1>
          <p className="text-muted-foreground">
            Ocorreu um erro inesperado. Tente novamente.
          </p>
        </div>
        <Button onClick={() => router.invalidate()}>Tentar novamente</Button>
      </div>
    </div>
  )
}
