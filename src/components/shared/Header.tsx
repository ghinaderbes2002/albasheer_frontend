import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  ShoppingCart,
  User as UserIcon,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/Logo'
import { LangSwitcher } from '@/components/shared/LangSwitcher'
import { useAuthStore } from '@/store/auth'
import { useCartCount } from '@/store/cart'
import { cn } from '@/lib/utils'

export function Header() {
  const { t } = useTranslation()
  const location = useLocation()
  const accessToken = useAuthStore((s) => s.accessToken)
  const role = useAuthStore((s) => s.role)
  const logout = useAuthStore((s) => s.logout)
  const cartCount = useCartCount()
  const isAuthed = !!accessToken
  const isStaff = role === 'branch_manager' || role === 'delivery' || role === 'admin'
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close drawer on route change.
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const dashboardLink =
    role === 'admin'
      ? { to: '/admin', label: t('admin.nav.dashboard') }
      : role === 'branch_manager'
        ? { to: '/dashboard/branch', label: t('dashboard.branch.short') }
        : role === 'delivery'
          ? { to: '/dashboard/delivery', label: t('dashboard.delivery.short') }
          : null

  const links = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/products', label: t('nav.products'), end: false },
    { to: '/bundles', label: t('nav.bundles'), end: false },
    { to: '/branches', label: t('nav.branches'), end: false },
    ...(isAuthed && !isStaff
      ? [
          { to: '/orders', label: t('nav.myOrders'), end: false },
          { to: '/addresses', label: t('nav.addresses'), end: false },
        ]
      : []),
    ...(dashboardLink ? [{ ...dashboardLink, end: false }] : []),
    ...(role === 'branch_manager'
      ? [{ to: '/dashboard/branch/payment-methods', label: t('paymentMethods.title'), end: false }]
      : []),
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="me-auto hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'relative rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  <span
                    aria-hidden
                    className={cn(
                      'absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary transition-all duration-200',
                      isActive ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right side actions — same on mobile + desktop */}
        <div className="ms-auto flex items-center gap-1 md:ms-0">
          <LangSwitcher />

          {!isStaff && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label={t('nav.cart')}
              className="relative"
            >
              <Link to="/cart">
                <ShoppingCart />
                {cartCount > 0 && (
                  <span className="absolute -inset-e-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background animate-in zoom-in duration-200">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
          )}

          {isStaff && dashboardLink && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label={dashboardLink.label}
              className="hidden sm:inline-flex"
            >
              <Link to={dashboardLink.to}>
                <LayoutDashboard />
              </Link>
            </Button>
          )}

          {isAuthed ? (
            <>
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label={t('nav.profile')}
                className="hidden sm:inline-flex"
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
                className="hidden sm:inline-flex"
              >
                <LogOut />
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/login">
                <LogIn />
                <span>{t('nav.login')}</span>
              </Link>
            </Button>
          )}

          {/* Hamburger — mobile only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={t('common.search')}
            aria-expanded={mobileOpen}
            className="md:hidden"
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden animate-in slide-in-from-top-2 fade-in duration-200">
          <nav className="flex flex-col gap-1 p-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-muted',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-2 flex items-center gap-2 border-t border-border pt-2">
              {isAuthed ? (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    className="flex-1 justify-start"
                  >
                    <Link to="/profile">
                      <UserIcon />
                      {t('nav.profile')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="flex-1 justify-start"
                  >
                    <Link to="/addresses">
                      <MapPin />
                      {t('nav.addresses')}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={logout}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <LogOut />
                  </Button>
                </>
              ) : (
                <Button asChild className="flex-1">
                  <Link to="/login">
                    <LogIn />
                    {t('nav.login')}
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
