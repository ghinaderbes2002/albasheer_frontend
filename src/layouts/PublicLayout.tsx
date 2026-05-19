import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'

export function PublicLayout() {
  const role = useAuthStore((s) => s.role)

  if (role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
