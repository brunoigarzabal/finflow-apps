type Props = {
  number?: number | null
  count?: number | null
}

export const InstallmentBadge = ({ number, count }: Props) => (
  <span
    title="Lançamento parcelado"
    className="text-xs font-medium text-muted-foreground"
  >
    ({number ?? '?'}/{count ?? '?'})
  </span>
)
