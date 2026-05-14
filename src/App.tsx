import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import '@/lib/i18n'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/routes'
import { useDirectionSync } from '@/hooks/useDirection'
import { AuthBootstrap } from '@/components/shared/AuthBootstrap'

function App() {
  useDirectionSync()
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--color-secondary)',
            color: 'var(--color-secondary-foreground)',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            boxShadow:
              '0 10px 30px -10px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.15)',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 500,
          },
          success: {
            iconTheme: {
              primary: 'var(--color-primary)',
              secondary: 'var(--color-secondary)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-destructive)',
              secondary: 'var(--color-secondary)',
            },
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
