import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    // Source maps fix the "Missing source maps" Best Practices audit.
    // They're only fetched by devtools, never by normal users.
    sourcemap: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/@tanstack/react-query-devtools')) {
            return 'vendor-devtools'
          }
          if (id.includes('node_modules/@tanstack/')) {
            return 'vendor-query'
          }
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'vendor-i18n'
          }
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/react-hot-toast')) {
            return 'vendor-ui'
          }
          if (id.includes('node_modules/react-helmet-async') || id.includes('node_modules/axios') || id.includes('node_modules/zustand')) {
            return 'vendor-misc'
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
