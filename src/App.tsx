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
          style: {
            background: 'var(--color-secondary)',
            color: 'var(--color-secondary-foreground)',
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
