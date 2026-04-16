import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@workspace/ui/lib/utils'
import { useState } from 'react'

import {
  getInstitutionFromIcon,
  getInstitutionInitials,
} from '@/config/financialInstitutions'
import { getIconByName } from '@/lib/icons'

type Props = {
  icon: string
  color: string
  className?: string
  iconClassName?: string
  strokeWidth?: number
  title?: string
}

export const BankAccountIcon = ({
  icon,
  color,
  className,
  iconClassName,
  strokeWidth = 1.5,
  title,
}: Props) => {
  const institution = getInstitutionFromIcon(icon)
  const [imageError, setImageError] = useState(false)

  const wrapperClass = cn(
    'flex shrink-0 items-center justify-center rounded-full',
    className
  )

  if (institution && !imageError) {
    return (
      <span
        className={cn(wrapperClass, 'overflow-hidden bg-white')}
        title={title ?? institution.name}
      >
        <img
          src={institution.logo}
          alt={institution.name}
          className="size-full object-cover"
          onError={() => setImageError(true)}
        />
      </span>
    )
  }

  if (institution) {
    return (
      <span
        className={wrapperClass}
        style={{ backgroundColor: institution.color }}
        title={title ?? institution.name}
      >
        <span className={cn('text-[0.4em] font-bold text-white uppercase')}>
          {getInstitutionInitials(institution.name)}
        </span>
      </span>
    )
  }

  return (
    <span
      className={wrapperClass}
      style={{ backgroundColor: color }}
      title={title}
    >
      <HugeiconsIcon
        icon={getIconByName(icon)}
        strokeWidth={strokeWidth}
        className={cn('text-white', iconClassName)}
      />
    </span>
  )
}
