import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Pre-bundle barrel-imported icon library to eliminate
    // 200-800ms cold-start cost from lucide-react's barrel index.
    include: ['lucide-react'],
  },
})
