import aleloLogo from '@/assets/banks/alelo.png'
import bbLogo from '@/assets/banks/bb.png'
import bradescoLogo from '@/assets/banks/bradesco.png'
import btgPactualLogo from '@/assets/banks/btgpactual.png'
import flashLogo from '@/assets/banks/flash.png'
import interLogo from '@/assets/banks/intermedium.png'
import interPjLogo from '@/assets/banks/interpj.png'
import itauLogo from '@/assets/banks/itau.png'
import mercadoPagoLogo from '@/assets/banks/mercadopago.png'
import nubankLogo from '@/assets/banks/nubank.png'
import santanderLogo from '@/assets/banks/santander.png'
import ticketLogo from '@/assets/banks/ticket.png'

export type FinancialInstitution = {
  id: string
  name: string
  color: string
  logo: string
}

const INSTITUTION_ICON_PREFIX = 'bank:'

export const FINANCIAL_INSTITUTIONS: FinancialInstitution[] = [
  { id: 'nubank', name: 'Nubank', color: '#820ad1', logo: nubankLogo },
  { id: 'itau', name: 'Itaú', color: '#ec7000', logo: itauLogo },
  { id: 'bradesco', name: 'Bradesco', color: '#cc092f', logo: bradescoLogo },
  { id: 'santander', name: 'Santander', color: '#ec0000', logo: santanderLogo },
  { id: 'inter', name: 'Inter', color: '#ff7a00', logo: interLogo },
  { id: 'interpj', name: 'Inter PJ', color: '#ff7a00', logo: interPjLogo },
  {
    id: 'btgpactual',
    name: 'BTG Pactual',
    color: '#001e2b',
    logo: btgPactualLogo,
  },
  { id: 'bb', name: 'Banco do Brasil', color: '#f9cf00', logo: bbLogo },
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    color: '#00b1ea',
    logo: mercadoPagoLogo,
  },
  { id: 'alelo', name: 'Alelo', color: '#00a88e', logo: aleloLogo },
  { id: 'flash', name: 'Flash', color: '#ff3d71', logo: flashLogo },
  { id: 'ticket', name: 'Ticket', color: '#d81e5b', logo: ticketLogo },
]

export const toInstitutionIcon = (id: string) =>
  `${INSTITUTION_ICON_PREFIX}${id}`

export const parseInstitutionIcon = (icon: string): string | null => {
  if (!icon.startsWith(INSTITUTION_ICON_PREFIX)) return null
  return icon.slice(INSTITUTION_ICON_PREFIX.length)
}

export const getInstitutionById = (id: string): FinancialInstitution | null =>
  FINANCIAL_INSTITUTIONS.find((institution) => institution.id === id) ?? null

export const getInstitutionFromIcon = (
  icon: string
): FinancialInstitution | null => {
  const id = parseInstitutionIcon(icon)
  return id ? getInstitutionById(id) : null
}

export { getInitials as getInstitutionInitials } from '@/lib/getInitials'
