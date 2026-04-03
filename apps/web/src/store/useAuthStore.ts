import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type AuthState = {
  isAuthenticated: boolean
  setAuthenticated: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        isAuthenticated: false,
        setAuthenticated: (value) => set({ isAuthenticated: value }),
      }),
      { name: '@finflow/auth' }
    )
  )
)
