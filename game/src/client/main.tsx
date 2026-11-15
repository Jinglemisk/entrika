/// <reference types="vite/client" />
import { createRoot } from 'react-dom/client';
import '../../../ui/v3/src/ui.css';
import './game.css';
import { App } from './App.tsx';
import { Gallery } from './screens/Gallery.tsx';

const gallery = new URLSearchParams(location.search).has('kartlar');
createRoot(document.getElementById('root')!).render(gallery ? <Gallery /> : <App />);
