import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ChevronDown,
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
import { useHasPendingReceipt } from '@/features/orders/queries'
import { useCategories } from '@/features/catalog/queries'
import { resolveMediaUrl } from '@/lib/api'
import { pickLang } from '@/lib/format'
import { cn } from '@/lib/utils'

export function Header() {
  const { t } = useTranslation()
  const location = useLocation()
  const accessToken = useAuthStore((s) => s.accessToken)
  const role = useAuthStore((s) => s.role)
  const logout = useAuthStore((s) => s.logout)
  const cartCount = useCartCount()
  const isAuthed = !!accessToken
  const isStaff = role === 'branch_manager' || role === 'delivery' || role === 'admin' || role === 'content_manager'
  const [mobileOpen, setMobileOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const { data: hasPendingReceipt } = useHasPendingReceipt(isAuthed && !isStaff)
  const { data: categories } = useCategories()
  const { i18n } = useTranslation()

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
          : role === 'content_manager'
            ? { to: '/content', label: t('admin.nav.dashboard') }
            : null

  const links = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/products', label: t('nav.products'), end: false },
    { to: '/bundles', label: t('nav.bundles'), end: false },
    { to: '/branches', label: t('nav.branches'), end: false },
    ...(isAuthed && !isStaff
      ? [
          { to: '/orders', label: t('nav.myOrders'), end: false, dot: hasPendingReceipt },
          { to: '/addresses', label: t('nav.addresses'), end: false },
        ]
      : []),
    ...(dashboardLink ? [{ ...dashboardLink, end: false }] : []),
    ...(role === 'branch_manager'
      ? [
          { to: '/dashboard/branch/payment-methods', label: t('paymentMethods.title'), end: false },
          { to: '/dashboard/branch/delivery-staff', label: t('dashboard.staff.title'), end: false },
        ]
      : []),
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/90 backdrop-blur-xl shadow-warm">
      <div className="mx-auto flex h-18 max-w-7xl items-center px-4">
        {/* Logo — start */}
        <div className="flex flex-1 items-center">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>
        </div>

        {/* Desktop nav — center */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {/* الرئيسية — first link */}
          {links.slice(0, 1).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-foreground text-background font-semibold'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              <span className="relative">
                {link.label}
                {'dot' in link && link.dot && (
                  <span className="absolute -top-0.5 -inset-e-2 size-1.5 rounded-full bg-destructive" />
                )}
              </span>
            </NavLink>
          ))}

          {/* Categories dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
          >
            <button
              type="button"
              className={cn(
                'flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                catOpen ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t('home.categories.title')}
              <ChevronDown className={cn('size-3.5 transition-transform duration-200', catOpen && 'rotate-180')} />
            </button>

            {catOpen && categories && categories.length > 0 && (
              <div className="absolute inset-s-0 top-full z-50 mt-2 w-105 rounded-2xl border border-border bg-background p-4 shadow-warm-lg">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t('home.categories.title')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((c) => {
                    const icon = resolveMediaUrl(c.icon)
                    const name = pickLang(c.name, c.name_ar, i18n.language)
                    return (
                      <Link
                        key={c.id}
                        to={`/products?category=${c.slug}`}
                        onClick={() => setCatOpen(false)}
                        className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                          {icon
                            ? <img src={icon} alt="" className="size-6 object-contain" />
                            : <span className="text-sm font-bold text-primary">{name.charAt(0)}</span>
                          }
                        </div>
                        <span className="text-sm font-medium text-foreground leading-tight">{name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Remaining links after home */}
          {links.slice(1).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-foreground text-background font-semibold'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              <span className="relative">
                {link.label}
                {'dot' in link && link.dot && (
                  <span className="absolute -top-0.5 -inset-e-2 size-1.5 rounded-full bg-destructive" />
                )}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Actions — end */}
        <div className="flex flex-1 items-center justify-end gap-1">
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
          <div className="relative md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={t('common.search')}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X /> : <Menu />}
            </Button>
            {hasPendingReceipt && !mobileOpen && (
              <span className="absolute top-1 inset-e-1 size-2.5 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
            )}
          </div>
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
                    'rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-foreground font-semibold'
                      : 'text-foreground hover:bg-muted',
                  )
                }
              >
                <span className="relative">
                  {link.label}
                  {'dot' in link && link.dot && (
                    <span className="absolute -top-0.5 -inset-e-2 size-1.5 rounded-full bg-destructive" />
                  )}
                </span>
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
