import react from '@vitejs/plugin-react'
import { defineConfig, searchForWorkspaceRoot } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    // the apps (projects/apps/*) are separate packages: make sure they all share the copy of the shell
    dedupe: ['react', 'react-dom', '@tanstack/react-query', '@mantine/core', '@mantine/hooks']
  },
  server: {
    fs: {
      // apps/mineio links the sibling repository ../mine.io (its sources are outside of this workspace)
      allow: [searchForWorkspaceRoot(process.cwd()), '../../../mine.io']
    }
  }
})
