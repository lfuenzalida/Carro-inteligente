import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Products from './pages/Products';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoutes';
import Header from './components/Header';

const App = () => {
  const location = useLocation();

  const hideHeaderOnPaths = ['/login']; // puedes añadir '/register' si lo implementas
  const shouldShowHeader = !hideHeaderOnPaths.includes(location.pathname);

  return (
    <>
      {shouldShowHeader && <Header />}
      <Routes>
        <Route path="/" element={<Navigate to="/productos" />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/productos"
          element={
            <PrivateRoute>
              <Products />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<h1>Página no encontrada</h1>} />
      </Routes>
    </>
  );
};

export default App;



