import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type PrivacyState = {
  isHidden: boolean
  toggleHidden: () => void
}

export const usePrivacyStore = create<PrivacyState>()(
  devtools(
    persist(
      (set) => ({
        isHidden: false,
        toggleHidden: () => set((state) => ({ isHidden: !state.isHidden })),
      }),
      { name: '@finflow/privacy' }
    )
  )
)
