import { Fragment } from 'react'

import { ProfileHero } from './components/ProfileHero'
import { ProfileStats } from './components/ProfileStats'

export const ProfilePage = () => (
  <Fragment>
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Minha Conta</h1>

      <ProfileHero />

      <ProfileStats />
    </div>
  </Fragment>
)
