import path from 'path'
import { defineConfig } from 'vite'
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
  server: {
    watch: {
      // db.json is the API's data, not app source. Every POST makes
      // json-server rewrite it, and without this Vite would see the change
      // and full-reload the page -- which hides whether invalidateQueries
      // actually refreshed the list, and wipes whatever is in the form.
      ignored: ['**/db.json'],
    },
  },
})
