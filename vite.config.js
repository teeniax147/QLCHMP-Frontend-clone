import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base:"/",
  plugins: [react({
    include: "**/*.jsx",
  })],
  server: {
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: 'https://api.glamour.io.vn', // Địa chỉ backend .NET Core
        changeOrigin: true,
        secure: false // Dùng cho HTTPS nếu bạn không có chứng chỉ tin cậy
      }
    }
  }
})
