import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 專案頁路徑
  base: "/flag_adventure/",
  plugins: [react(), tailwindcss()],
})
