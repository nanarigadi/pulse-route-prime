import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import "leaflet/dist/leaflet.css";

// Always use dark mode; remove any persisted theme switching
document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(<App />);
