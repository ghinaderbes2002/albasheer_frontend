import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BarChart3,
  Boxes,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MapPin,
  Megaphone,
  Menu,
  Package,
  Settings,
  Sliders,
  Tag,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { LangSwitcher } from '@/components/shared/LangSwitcher'

const NAV_ITEMS = [
  { to: '/admin', label: 'admin.nav.dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'admin.nav.users', icon: Users },
  { to: '/admin/branches', label: 'admin.nav.branches', icon: Building2 },
  { to: '/admin/cities', label: 'admin.nav.cities', icon: MapPin },
  { to: '/admin/categories', label: 'admin.nav.categories', icon: Tag },
  { to: '/admin/products', label: 'admin.nav.products', icon: Package },
  { to: '/admin/bundles', label: 'admin.nav.bundles', icon: Boxes },
  { to: '/admin/variant-types', label: 'admin.nav.variantTypes', icon: Sliders },
  { to: '/admin/ads', label: 'admin.nav.ads', icon: Megaphone },
  { to: '/admin/orders', label: 'admin.nav.orders', icon: ClipboardList },
  { to: '/admin/payment-methods', label: 'admin.nav.paymentMethods', icon: CreditCard },
  { to: '/admin/reports', label: 'admin.nav.reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'admin.nav.settings', icon: Settings },
]

export function AdminLayout() {
  const { t } = useTranslation()
  const logout = useAuthStore((s) => s.logout)
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // close mobile drawer on route change
  useState(() => {
    setMobileOpen(false)
  })

  return (
    <div className="flex min-h-svh bg-muted/30" dir="rtl">
      {/* Sidebar — desktop */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-e border-border bg-background transition-all duration-200 shrink-0 sticky top-0 h-svh',
          collapsed ? 'w-16' : 'w-56',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-3">
          {!collapsed && (
            <Link to="/admin" className="flex items-center gap-2">
              <Logo />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed && 'justify-center px-2',
                )
              }
              title={collapsed ? t(item.label) : undefined}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && <span>{t(item.label)}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={cn('flex items-center gap-2 border-t border-border p-3', collapsed && 'justify-center')}>
          <LangSwitcher />
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="flex-1 justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4" />
              {t('nav.logout')}
            </Button>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 inset-e-0 z-50 flex w-64 flex-col border-s border-border bg-background transition-transform duration-200 md:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Logo />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
            <X className="size-4" />
          </Button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted',
                )
              }
            >
              <item.icon className="size-4 shrink-0" />
              <span>{t(item.label)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2 border-t border-border p-3">
          <LangSwitcher />
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="flex-1 justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4" />
            {t('nav.logout')}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar — mobile */}
        <header className="flex h-16 items-center gap-3 border-b border-border bg-background px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <Logo />
          <div className="ms-auto">
            <LangSwitcher />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
