import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const MARK_WALLPAPERS_ORIGIN = 'http://192.168.77.46:8002'

export default defineConfig({
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    // 开发时浏览器直连 markwallpapers.com 会触发 CORS；走本地同源 /api 由 Vite 转发
    proxy: {
      '/api': {
        target: MARK_WALLPAPERS_ORIGIN,
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
