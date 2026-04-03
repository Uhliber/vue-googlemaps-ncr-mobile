import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Proxy /api/opencellid/* → https://opencellid.org/* in development.
      // This avoids CORS issues since the request comes from the Vite Node.js
      // process rather than the browser. The token is still sent in the query
      // string but never exposed as a cross-origin browser request.
      '/api/opencellid': {
        target: 'https://opencellid.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/opencellid/, ''),
      },
    },
  },
})
