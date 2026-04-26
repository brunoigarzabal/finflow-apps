import { toast } from 'sonner'

export const toastError = (err: unknown, fallback: string) => {
  toast.error(err instanceof Error ? err.message : fallback)
}
