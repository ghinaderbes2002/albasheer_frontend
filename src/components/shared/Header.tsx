import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogIn, LogOut, ShoppingCart, User as UserIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/Logo'
import { LangSwitcher } from '@/components/shared/LangSwitcher'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

export function Header() {
  const { t } = useTranslation()
  const accessToken = useAuthStore((s) => s.accessToken)
  const logout = useAuthStore((s) => s.logout)
  const isAuthed = !!accessToken

  const links = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/products', label: t('nav.products') },
    { to: '/branches', label: t('nav.branches') },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LangSwitcher />

          {isAuthed ? (
            <>
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label={t('nav.cart')}
              >
                <Link to="/cart">
                  <ShoppingCart />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label={t('nav.profile')}
              >
                <Link to="/profile">
                  <UserIcon />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                aria-label={t('nav.logout')}
              >
                <LogOut />
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">
                <LogIn />
                <span>{t('nav.login')}</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
