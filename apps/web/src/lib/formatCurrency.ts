const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatCurrency = (cents: number): string =>
  currencyFormatter.format(cents / 100)

export const formatNumber = (cents: number): string =>
  numberFormatter.format(cents / 100)
