import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'

// ONE client for the whole app. It owns the cache every useQuery reads, and it
// is created OUT here -- inside the tree a re-render would throw the cache away.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default is 3 retries: a failure takes ~7s to show. 1 retry: about a second.
      retry: 1,
      // networkMode "always" is GONE. It was there because json-server ran on
      // localhost and answered with wifi off. The API is on Vercel and its
      // data in Atlas now, so the default "online" mode is right: offline,
      // Query pauses instead of failing every request.
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
