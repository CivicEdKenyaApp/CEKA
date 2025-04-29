import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Browser Router } from 'react-router-dom'

createRoot(document.getElementById("root")!).render(
  <Browser>
    <App />
  </Browser>
  );
