/// <reference types="vite/client" />
import { createRoot } from 'react-dom/client';
import '../../../ui/v3/src/ui.css';
import './game.css';
import { App } from './App.tsx';

createRoot(document.getElementById('root')!).render(<App />);
