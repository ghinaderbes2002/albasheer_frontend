import { Outlet } from 'react-router-dom'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'

export function PublicLayout() {
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
