/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
  build: {
    rollupOptions: {
      output: {
        // 자주 바뀌지 않는 라이브러리는 따로 묶어 배포가 바뀌어도 브라우저 캐시를 재사용한다
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) return 'charts'
          if (id.includes('lucide-react')) return 'icons'
          if (/[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'react'
        },
      },
    },
  },
})
