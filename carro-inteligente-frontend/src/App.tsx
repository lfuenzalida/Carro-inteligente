// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Products from './pages/Products';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/productos" />} />
      <Route path="/productos" element={<Products />} />
      <Route path="*" element={<h1>Página no encontrada</h1>} />
    </Routes>
  );
};

export default App;

