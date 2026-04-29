import { Link } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

import { useProfile, useLogout } from '@/api/auth'
import { getInitials } from '@/lib/getInitials'

export const UserMenu = () => {
  const { data } = useProfile()
  const logout = useLogout()

  const name = data?.user.name ?? ''
  const email = data?.user.email ?? ''
  const initials = name ? getInitials(name) : '?'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        openOnHover
        aria-haspopup="menu"
        render={
          <button className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground" />
        }
      >
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {name}
              </span>
              <span className="text-xs text-muted-foreground">{email}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to="/profile" />}>
          Minha Conta
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout.mutate(undefined)}>
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
