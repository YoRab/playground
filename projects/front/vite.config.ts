import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    // the apps (projects/apps/*) are separate packages: make sure they all share the copy of the shell
    dedupe: ['react', 'react-dom', '@tanstack/react-query']
  }
})
