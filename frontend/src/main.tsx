import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import './index.css'
import App from './App.tsx'

function resolveUserRole(): string {
  if (typeof window === 'undefined') {
    return 'ADMIN'
  }
  const role = window.localStorage.getItem('ctc_user_role') || window.localStorage.getItem('user_role') || 'ADMIN'
  return String(role).trim().toUpperCase() || 'ADMIN'
}

// Many screens use plain axios directly; set role header globally for those requests.
axios.interceptors.request.use((config) => {
  config.headers = config.headers ?? {}
  config.headers['X-User-Role'] = resolveUserRole()
  return config
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
}
