import { QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({
        default: m.ReactQueryDevtools,
      })),
    )
  : null

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
      {ReactQueryDevtools && (
        <Suspense>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  )
}

export default App
