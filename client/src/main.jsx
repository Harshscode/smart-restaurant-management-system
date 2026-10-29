import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
// The original Phase 1 components have their own styles. Load them before
// the newer homepage styles so the homepage and About designs are retained.
import './styles/main.css';
import './styles/home.css';
import './styles/remaining.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
