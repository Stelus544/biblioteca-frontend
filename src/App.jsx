import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Componentes
import Navbar from './components/Navbar';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import MyLoans from './pages/MyLoans';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About'; // <-- IMPORTANTE

// Estilos globales
import './App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Cargando sesión...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/catalog'} replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Ruta de Quiénes Somos (Accesible para todos) */}
          <Route path="/about" element={<About />} />

          {/* Rutas Protegidas de Estudiantes */}
          <Route
            path="/catalog"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <Catalog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-loans"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <MyLoans />
              </ProtectedRoute>
            }
          />

          {/* Ruta del Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}