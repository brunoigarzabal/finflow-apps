import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { useTheme } from '@/components/theme-provider'

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()

  const isDark =
    theme === 'dark' || (theme === 'system' && getSystemTheme() === 'dark')

  const toggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggle}
      className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
    >
      <HugeiconsIcon
        icon={isDark ? Sun03Icon : Moon02Icon}
        strokeWidth={2}
        className="size-4"
      />
      <span className="sr-only">Alternar tema</span>
    </button>
  )
}

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}
