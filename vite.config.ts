import path from 'path'
// vitest/config, not vite: the same defineConfig, plus the type of the `test`
// key below. Vitest reads THIS file, so the plugins and the "@" alias work in
// tests with no second config.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // The runtime half of the "@/" alias -- tsconfig only type-checks it.
      // import.meta.dirname, NOT __dirname: this file is an ES module, and
      // Vite warns that __dirname is unsupported by its config loader. The
      // shadcn docs still show __dirname; same value, one fewer warning.
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  // npm run dev and npm run build skip this block; npm test reads it.
  test: {
    // A pretend browser page inside Node, so render() has a document to put
    // the component in.
    environment: 'jsdom',
    // Runs before every test file: the toBeInTheDocument family of checks,
    // and a clean page between tests.
    setupFiles: ['./src/test/setup.ts'],
    // client.ts throws at import time without VITE_API_URL, and LoginPage
    // imports client.ts. The tests never call this address -- they check the
    // form stops BEFORE any request -- so a fixed value means no .env is
    // needed, on this laptop or on GitHub.
    env: { VITE_API_URL: 'http://localhost:4000' },
  },
})
