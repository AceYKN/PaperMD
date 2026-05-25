import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/PaperMD/' : '/',
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue'],
          'vendor-markdown': ['markdown-it', 'markdown-it-texmath'],
          'vendor-katex': ['katex'],
          'vendor-highlight': ['highlight.js'],
          'vendor-icons': ['@lucide/vue'],
        },
      },
    },
  },
})
