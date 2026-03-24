import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif}']
      },
      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        suppressWarnings: true
      },
      manifest: {
        name: 'Notes Chat',
        short_name: 'Notes',
        description: 'A mobile-friendly notes chat application',
        theme_color: '#6502e7',
        background_color: '#6502e7',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: "notes-chat-screen-1.png",
            sizes: "1080x1920",
            type: "image/png",
            form_factor: "narrow",
            label: "Interfaccia Mobile"
          },
          {
            src: "notes-chat-screen-1.png",
            sizes: "1920x1080",
            type: "image/png",
            form_factor: "wide",
            label: "Interfaccia Desktop"
          }
        ]
      }
    })
  ],
  server: {
    port: '8080'
  }
})
