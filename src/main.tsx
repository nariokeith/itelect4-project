import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* BrowserRouter watches the address bar and tells everything inside it
        the moment the URL changes. It wraps <App />, not the other way round:
        any component calling useNavigate or rendering a <Link> must be inside
        this wrapper, or it throws at runtime. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
