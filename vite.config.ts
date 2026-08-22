import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
