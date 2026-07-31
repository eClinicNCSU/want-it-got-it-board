import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Keep the installed kiosk current: a new deploy updates the app on next load.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Want it Got It — NC State Garage',
        short_name: 'Want it Got It',
        description:
          'Skills board for the NC State Entrepreneurship Garage — post what you want or what you can do.',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        // Chromium honours fullscreen (no status bar) for a true kiosk look;
        // iOS falls back to standalone.
        display_override: ['fullscreen', 'standalone'],
        background_color: '#0b0a10',
        theme_color: '#0b0a10',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // SPA: serve the app shell for client-side routes when offline.
        navigateFallback: '/index.html',
        // Only precache the built app shell — never cache Supabase API responses,
        // so the board data always comes from the network (stays live).
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
})
