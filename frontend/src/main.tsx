import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log("main.tsx executing!"); // Debug log

const rootElement = document.getElementById('root');
console.log("Root element:", rootElement); // Debug log

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  console.log("React render called!"); // Debug log
}
