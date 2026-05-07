import { Outlet } from 'react-router-dom'
import { Header } from '@/components/shared/Header'

export function DashboardLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
