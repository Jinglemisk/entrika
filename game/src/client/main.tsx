/// <reference types="vite/client" />
import { createRoot } from 'react-dom/client';
import '../../../ui/v3/src/ui.css';
import './game.css';
import { App } from './App.tsx';
import { Gallery } from './screens/Gallery.tsx';
import { Editor } from './screens/Editor.tsx';

const q = new URLSearchParams(location.search);
// the card text editor saves through the dev server, so it only opens there
const page = q.has('kartlar') ? <Gallery /> : q.has('duzenle') && import.meta.env.DEV ? <Editor /> : <App />;
createRoot(document.getElementById('root')!).render(page);
