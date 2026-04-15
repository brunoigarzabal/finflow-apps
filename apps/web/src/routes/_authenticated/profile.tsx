import { createFileRoute } from '@tanstack/react-router'

import { ProfilePage } from '@/modules/settings'

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
})
