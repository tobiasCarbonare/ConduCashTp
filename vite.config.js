import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg', 'vite.svg'],
      manifest: {
        name: 'TransportApp',
        short_name: 'TransportApp',
        description: 'Gestión de ganancias y mantenimiento para conductores',
        theme_color: '#1e3a8a', // blue-900 para combinar con el gradiente
        background_color: '#0f172a', // slate-900
        display: 'standalone',
        icons: [
          {
            src: 'logo.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'logo-maskable.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
})
