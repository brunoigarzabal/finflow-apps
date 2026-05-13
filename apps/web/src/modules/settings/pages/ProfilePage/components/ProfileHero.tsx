import { Mail01Icon, ShieldUserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Fragment } from 'react'

import { useProfile } from '@/api/auth'
import { getInitials } from '@/lib/getInitials'

export const ProfileHero = () => {
  const { data, isLoading } = useProfile()

  const name = data?.user.name ?? ''
  const email = data?.user.email ?? ''
  const avatarUrl = data?.user.avatarUrl
  const initials = name ? getInitials(name) : '?'

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
      <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-primary/8" />
      <div className="pointer-events-none absolute top-20 -right-8 size-32 rounded-full bg-primary/5" />

      <CardContent className="relative flex flex-col items-center gap-5 py-6 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
        {isLoading ? (
          <Skeleton className="size-24 rounded-full" />
        ) : (
          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-2xl font-semibold text-primary-foreground shadow-md ring-4 ring-background">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="size-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              initials
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {isLoading ? (
            <Fragment>
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </Fragment>
          ) : (
            <Fragment>
              <h2 className="text-2xl font-bold tracking-tight">{name}</h2>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground sm:justify-start">
                <HugeiconsIcon
                  icon={Mail01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                <span className="break-all">{email}</span>
              </div>
            </Fragment>
          )}

          <div className="mt-1 inline-flex items-center justify-center gap-1.5 self-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:self-start">
            <HugeiconsIcon
              icon={ShieldUserIcon}
              strokeWidth={2}
              className="size-3.5"
            />
            Conta verificada
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
