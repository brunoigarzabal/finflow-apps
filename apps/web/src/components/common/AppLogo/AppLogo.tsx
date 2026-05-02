type Props = {
  className?: string
}

export const AppLogo = ({ className = 'size-6' }: Props) => (
  <img src="/favicon.svg" alt="Minhas Finanças" className={className} />
)
