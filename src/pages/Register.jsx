import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import './Login.css'; // Reutilizamos estilos base de Auth

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [curso, setCurso] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await API.post('/auth/register', {
        nombre,
        email,
        password,
        curso,
        role
      });
      login(response.data.user);
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/catalog');
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrarse');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Crear Cuenta</h2>
        <p className="auth-subtitle">Regístrate para solicitar libros en la biblioteca</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nombre Completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@colegio.edu.co"
              required
            />
          </div>

          <div className="form-group">
            <label>Curso / Grupo</label>
            <input
              type="text"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              placeholder="Ej: 1101, 1002, Docente"
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo de Cuenta</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">Estudiante (Usuario)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Registrarse
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}