import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-left">
          <Link to="/" className="logo">Super Market</Link>
        </div>
        <div className="nav-right">
          <Link to="/inicio" className="nav-link">Inicio</Link>
          <Link to="/productos" className="nav-link">Productos</Link>
          <Link to="/favoritos" className="nav-link">Mi carro favorito</Link>
          {userId ? (
            <button onClick={handleLogout} className="logout-btn">Cerrar sesión</button>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
