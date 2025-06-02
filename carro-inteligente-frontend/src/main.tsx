// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { SmartCartProvider } from './context/SmartCartContext';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SmartCartProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SmartCartProvider>
  </React.StrictMode>
);
