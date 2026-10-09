import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './About.css';

export default function About() {
  const { user } = useContext(AuthContext);
  const [team, setTeam] = useState([]);
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await API.get('/team');
      setTeam(res.data);
    } catch (err) {
      console.error('Error al cargar equipo:', err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');

    if (!file && !fotoUrl) {
      setError('Debes ingresar una URL de imagen o seleccionar un archivo.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('cargo', cargo);

      if (file) {
        formData.append('foto', file);
      } else if (fotoUrl) {
        formData.append('fotoUrl', fotoUrl);
      }

      await API.post('/team', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Limpiar campos
      setNombre('');
      setCargo('');
      setFotoUrl('');
      setFile(null);
      fetchTeam();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar el integrante');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar a este integrante?')) return;
    try {
      await API.delete(`/team/${id}`);
      fetchTeam();
    } catch (err) {
      console.error('Error al eliminar integrante:', err);
    }
  };

  return (
    <div className="about-container">
      <header className="about-header">
        <h2>Nuestro Equipo de Biblioteca</h2>
        <p>Conoce a los estudiantes y auxiliares que hacen posible este espacio</p>
      </header>

      {error && <div className="admin-alert alert-danger">{error}</div>}

      {/* Formulario solo accesible para administradores */}
      {user?.role === 'admin' && (
        <form onSubmit={handleAddMember} className="add-team-form">
          <h3>➕ Agregar Integrante del Equipo</h3>
          <div className="form-row">
            <input
              type="text"
              placeholder="Nombre del compañero"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Cargo (ej. Monitor de 11º)"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              required
            />
            <input
              type="url"
              placeholder="URL de foto o sube archivo"
              value={fotoUrl}
              onChange={(e) => setFotoUrl(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <div className="team-grid">
        {team.map((member) => {
          const imgUrl = member.foto.startsWith('http')
            ? member.foto
            : `http://localhost:5000${member.foto}`;

          return (
            <div key={member._id} className="team-card">
              <img src={imgUrl} alt={member.nombre} className="team-avatar" />
              <h3>{member.nombre}</h3>
              <p className="team-role">{member.cargo}</p>
              {user?.role === 'admin' && (
                <button onClick={() => handleDelete(member._id)} className="btn-delete-small">
                  Eliminar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}