import { usePrivacyStore } from '@/store'

type Props = {
  value: string
  className?: string
}

export const HiddenValue = ({ value, className }: Props) => {
  const isHidden = usePrivacyStore((s) => s.isHidden)

  return <span className={className}>{isHidden ? '••••••' : value}</span>
}
