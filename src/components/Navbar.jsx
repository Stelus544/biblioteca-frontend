import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar({ theme, toggleTheme }) {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const logout = auth?.logout;
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const isActive = (path) => (location.pathname === path ? 'active-link' : '');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* LOGO */}
        <Link to="/catalog" className="navbar-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-text">Biblioteca<span className="brand-accent">Escolar</span></span>
        </Link>

        {/* ENLACES DE NAVEGACIÓN */}
        <div className="navbar-links">
          <Link to="/catalog" className={`nav-link ${isActive('/catalog')}`}>
            Catálogo
          </Link>
          <Link to="/about" className={`nav-link ${isActive('/about')}`}>
            Quiénes Somos
          </Link>
          
          {/* Pestaña Mis Préstamos para cualquier usuario logueado */}
          {user && (
            <Link to="/my-loans" className={`nav-link ${isActive('/my-loans')}`}>
              Mis Préstamos
            </Link>
          )}

          {/* Panel Admin solo si el rol es admin */}
          {(user?.role === 'admin' || user?.rol === 'admin') && (
            <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>
              Panel Admin
            </Link>
          )}
        </div>

        {/* USUARIO Y ACCIONES */}
        <div className="navbar-actions">
          {/* BOTÓN MODO CLARO / OSCURO */}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn" 
            type="button" 
            title="Cambiar tema"
          >
            {theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro'}
          </button>

          {user ? (
            <div className="user-profile">
              <span className="user-name">{user.nombre || user.email || 'Usuario'}</span>
              {(user.role === 'admin' || user.rol === 'admin') && (
                <span className="admin-badge">Admin</span>
              )}
              <button onClick={handleLogout} className="btn-logout" type="button">
                Salir
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-login-link">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}