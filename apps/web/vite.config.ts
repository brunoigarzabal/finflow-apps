import path from 'path'

import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg'],
      manifest: {
        name: 'Minhas Finanças',
        short_name: 'Minhas Finanças',
        description: 'Controle financeiro pessoal',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#ff9d19',
        background_color: '#0a0a0a',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
      },
    }),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
