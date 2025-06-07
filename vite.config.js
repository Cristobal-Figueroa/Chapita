import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: true,
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  define: {
    'process.env.VITE_APP_DOMAIN': JSON.stringify('chapita.codecland.com'),
    'process.env.VITE_APP_TITLE': JSON.stringify('Chapita - Pokémon MMO'),
  },
})
