import { Fragment } from 'react'

import { useProfile } from '@/api/auth'

export const ProfilePage = () => {
  const { data } = useProfile()

  const name = data?.user.name ?? ''
  const email = data?.user.email ?? ''

  return (
    <Fragment>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Minha Conta</h1>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Nome</span>
            <span className="text-sm font-medium">{name}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">E-mail</span>
            <span className="text-sm font-medium">{email}</span>
          </div>
        </div>
      </div>
    </Fragment>
  )
}
