import { Routes, Route, Navigate } from 'react-router-dom';
import Products from './pages/Products';
import Login from './pages/Login';
import Home from './pages/Home';
import FavoriteCartPage from './pages/FavoriteCart';
import PrivateRoute from './components/PrivateRoutes';
import { FavoriteCartProvider } from './context/FavoriteCartContext'; // 👈 importar el provider

const App = () => {

  return (
    <FavoriteCartProvider> {/* 👈 envolver aquí */}
      <>
        <Routes>
          <Route path="/" element={<Navigate to="/productos" />} />
          <Route path="/favoritos" element={<FavoriteCartPage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/productos"
            element={
              <PrivateRoute>
                <Products />
              </PrivateRoute>
            }
          />
          <Route
            path="/inicio"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<h1>Página no encontrada</h1>} />
        </Routes>
      </>
    </FavoriteCartProvider>
  );
};

export default App;
