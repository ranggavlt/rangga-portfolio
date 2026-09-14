import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core — smallest, most frequently cached
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'vendor-react'
          }
          // React Router
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run/')) {
            return 'vendor-router'
          }
          // Supabase client
          if (id.includes('node_modules/@supabase/') || id.includes('node_modules/ws/') || id.includes('node_modules/isomorphic-fetch/')) {
            return 'vendor-supabase'
          }
        },
      },
    },
  },
})
