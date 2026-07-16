import {
  GoogleIcon,
  Mail01Icon,
  SquareLockPasswordIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { useProfile } from '@/api/auth'

import { ChangeEmailDialog } from './ChangeEmailDialog'
import { ChangePasswordDialog } from './ChangePasswordDialog'
import { UnlinkGoogleDialog } from './UnlinkGoogleDialog'

const SET_PASSWORD_HINT = 'Defina uma senha para usar esta opção'

type SecurityRowProps = {
  icon: IconSvgElement
  title: string
  description: ReactNode
  action: ReactNode
}

const SecurityRow = ({
  icon,
  title,
  description,
  action,
}: SecurityRowProps) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <HugeiconsIcon icon={icon} strokeWidth={2} className="size-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </div>
    </div>
    {action}
  </div>
)

export const SecurityCard = () => {
  const { data, isLoading } = useProfile()
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false)

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  const { email, hasPassword, googleLinked } = data.user

  return (
    <Card>
      <CardHeader>
        <CardTitle>Segurança</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <SecurityRow
          icon={Mail01Icon}
          title="E-mail"
          description={hasPassword ? email : SET_PASSWORD_HINT}
          action={
            <Button
              variant="outline"
              disabled={!hasPassword}
              onClick={() => setEmailDialogOpen(true)}
            >
              Alterar e-mail
            </Button>
          }
        />

        <SecurityRow
          icon={SquareLockPasswordIcon}
          title="Senha"
          description={
            hasPassword
              ? 'Altere sua senha de acesso'
              : 'Você entra apenas com o Google. Defina uma senha para acessar com e-mail.'
          }
          action={
            <Button
              variant="outline"
              onClick={() => setPasswordDialogOpen(true)}
            >
              {hasPassword ? 'Alterar senha' : 'Definir senha'}
            </Button>
          }
        />

        {googleLinked && (
          <SecurityRow
            icon={GoogleIcon}
            title="Google"
            description={
              hasPassword ? 'Conta Google conectada' : SET_PASSWORD_HINT
            }
            action={
              <Button
                variant="outline"
                disabled={!hasPassword}
                onClick={() => setUnlinkDialogOpen(true)}
              >
                Desvincular
              </Button>
            }
          />
        )}
      </CardContent>

      <ChangeEmailDialog
        currentEmail={email}
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
      />
      <ChangePasswordDialog
        hasPassword={hasPassword}
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
      <UnlinkGoogleDialog
        open={unlinkDialogOpen}
        onOpenChange={setUnlinkDialogOpen}
      />
    </Card>
  )
}
