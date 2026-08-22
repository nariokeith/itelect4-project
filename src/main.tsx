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
      // Our API is json-server on localhost, so whether the LAPTOP has an
      // internet connection is irrelevant to whether it can be reached.
      // Under the default "online" mode Query refuses to even start a fetch
      // when the browser reports offline -- with wifi off, every page would
      // sit on its loading skeleton forever while json-server answers fine.
      networkMode: "always",
    },
    mutations: { networkMode: "always" },
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
