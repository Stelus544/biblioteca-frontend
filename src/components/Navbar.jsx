import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={user ? (user.role === 'admin' ? '/admin' : '/catalog') : '/login'} className="navbar-brand">
         Biblioteca Escolar
        </Link>

        <div className="navbar-menu">
          <Link to="/about" className="nav-link">Quiénes Somos</Link>

          {user && (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin" className="nav-link">Panel Admin</Link>
              ) : (
                <>
                  <Link to="/catalog" className="nav-link">Catálogo</Link>
                  <Link to="/my-loans" className="nav-link">Mis Préstamos</Link>
                </>
              )}
            </>
          )}

          <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle-btn">
            {darkMode ? '☀️ Claro' : '🌙 Oscuro'}
          </button>

          {user && (
            <div className="user-info">
              <span className="user-name">{user.nombre}</span>
              <span className="user-badge">{user.role === 'admin' ? 'Admin' : user.curso}</span>
              <button onClick={() => { logout(); navigate('/login'); }} className="btn-logout">
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}