import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/leetcode-1-two-sum/',
  server: {
    port: 63293,
  },
})
