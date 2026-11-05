import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('loans');
  
  const [loans, setLoans] = useState([]);
  const [loanDays, setLoanDays] = useState({});
  const [users, setUsers] = useState([]);
  const [editedUsers, setEditedUsers] = useState({});
  const [books, setBooks] = useState([]);

  // Crear Libro (Incluyendo Autor, Categoría y Clasificación Manual)
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [sinopsis, setSinopsis] = useState('');
  const [categoria, setCategoria] = useState('Literatura');
  const [customCategoria, setCustomCategoria] = useState('');
  const [clasificacion, setClasificacion] = useState('');
  const [stock, setStock] = useState(1);
  const [imageType, setImageType] = useState('url');
  const [portadaUrl, setPortadaUrl] = useState('');
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLoans();
    fetchUsers();
    fetchBooks();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await API.get('/loans');
      setLoans(res.data);
    } catch (err) {
      setError('Error al cargar préstamos.');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      setError('Error al cargar usuarios.');
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await API.get('/books');
      setBooks(res.data);
    } catch (err) {
      setError('Error al cargar libros.');
    }
  };

  // Aprobar Préstamo
  const handleApproveLoan = async (loanId) => {
    const days = loanDays[loanId] || 7;
    try {
      setMessage('');
      setError('');
      await API.put(`/loans/${loanId}/approve`, { dias: Number(days) });
      setMessage(`Préstamo aprobado por ${days} días.`);
      fetchLoans();
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al aprobar préstamo.');
    }
  };

  // Rechazar Préstamo
  const handleRejectLoan = async (loanId) => {
    if (!window.confirm('¿Deseas rechazar esta solicitud de préstamo?')) return;
    try {
      setMessage('');
      setError('');
      await API.put(`/loans/${loanId}/reject`);
      setMessage('Solicitud de préstamo rechazada.');
      fetchLoans();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al rechazar préstamo.');
    }
  };

  // Guardar Edición de Usuario
  const handleUserChange = (userId, field, value) => {
    setEditedUsers({
      ...editedUsers,
      [userId]: { ...editedUsers[userId], [field]: value }
    });
  };

  const handleSaveUser = async (userId, currentRole, currentCurso) => {
    try {
      setMessage('');
      setError('');
      const changes = editedUsers[userId] || {};
      await API.put(`/auth/users/${userId}`, {
        role: changes.role !== undefined ? changes.role : currentRole,
        curso: changes.curso !== undefined ? changes.curso : currentCurso
      });
      setMessage('Usuario actualizado.');
      fetchUsers();
    } catch (err) {
      setError('Error al actualizar usuario.');
    }
  };

  // 🟢 FUNCIÓN ROBUSTA PARA LAS PORTADAS (Corregida para Render y URLs externas)
  const getBookCoverUrl = (book) => {
    const rawPath = book?.portada || book?.portadaUrl || book?.imagen;
    if (!rawPath) return 'https://via.placeholder.com/150x200?text=Sin+Portada';
    
    // Si ya es un enlace web completo (URL externa), úsalo tal cual
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
      return rawPath;
    }

    // Apunta directamente al backend oficial de Render para evitar errores de conexión local en Vercel
    const backendUrl = 'https://biblioteca-backend-9c1i.onrender.com';
    const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    return `${backendUrl}${cleanPath}`;
  };

  // Crear Libro
  const handleCreateBook = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const finalCategoria = categoria === 'Otro' ? customCategoria : categoria;

      // Enviamos un objeto JSON limpio
      const bookData = {
        titulo,
        autor,
        descripcion: sinopsis,
        categoria: finalCategoria,
        clasificacion,
        stock: Number(stock),
        portada: portadaUrl // URL proporcionada
      };

      const token = localStorage.getItem('token');
      await API.post('/books', bookData, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });

      setMessage('¡Libro agregado correctamente!');
      setTitulo('');
      setAutor('');
      setSinopsis('');
      setCategoria('Literatura');
      setCustomCategoria('');
      setClasificacion('');
      setStock(1);
      setPortadaUrl('');
      fetchBooks();
      setActiveTab('manage-books');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.mensaje || 'Error al crear el libro.');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar Libro
  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este libro?')) return;
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Libro eliminado.');
      fetchBooks();
    } catch (err) {
      setError('Error al eliminar libro.');
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h2>Panel de Administración</h2>
        <p>Gestión global de préstamos, usuarios y catálogo de libros</p>
      </header>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'manage-books' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage-books')}
        >
         Catálogo ({books.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'loans' ? 'active' : ''}`}
          onClick={() => setActiveTab('loans')}
        >
         Solicitudes ({loans.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
         Usuarios ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'add-book' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-book')}
        >
         Agregar Libro
        </button>
      </div>

      {message && <div className="admin-alert alert-success">{message}</div>}
      {error && <div className="admin-alert alert-danger">{error}</div>}

      {/* PESTAÑA 1: PRÉSTAMOS */}
      {activeTab === 'loans' && (
        <div className="tab-content">
          <h3>Solicitudes de Préstamo</h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Curso</th>
                  <th>Libro</th>
                  <th>Fecha Solicitud</th>
                  <th>Estado</th>
                  <th>Días Límite</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan._id}>
                    <td>
                      <strong>{loan.usuario?.nombre}</strong>
                      <br />
                      <small className="text-muted">{loan.usuario?.email}</small>
                    </td>
                    <td><span className="badge-curso">{loan.usuario?.curso}</span></td>
                    <td>{loan.libro?.titulo || 'Libro eliminado'}</td>
                    <td>{new Date(loan.fechaSolicitud).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-pill ${loan.estado}`}>
                        {loan.estado}
                      </span>
                    </td>
                    <td>
                      {loan.estado === 'pendiente' ? (
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={loanDays[loan._id] || 7}
                          onChange={(e) => setLoanDays({ ...loanDays, [loan._id]: e.target.value })}
                          className="input-days"
                        />
                      ) : (
                        `${loan.diasAprobados || '-'} días`
                      )}
                    </td>
                    <td>
                      {loan.estado === 'pendiente' ? (
                        <div className="action-buttons-group">
                          <button
                            className="btn-approve"
                            onClick={() => handleApproveLoan(loan._id)}
                          >
                            Aprobar
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleRejectLoan(loan._id)}
                          >
                            Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted">Procesado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: USUARIOS */}
      {activeTab === 'users' && (
        <div className="tab-content">
          <h3>Lista de Usuarios Registrados</h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Correo Electrónico</th>
                  <th>Curso / Grupo</th>
                  <th>Rol</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const currentChanges = editedUsers[u._id] || {};
                  const userRole = currentChanges.role !== undefined ? currentChanges.role : u.role;
                  const userCurso = currentChanges.curso !== undefined ? currentChanges.curso : u.curso;

                  return (
                    <tr key={u._id}>
                      <td><strong>{u.nombre}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <input
                          type="text"
                          value={userCurso || ''}
                          onChange={(e) => handleUserChange(u._id, 'curso', e.target.value)}
                          className="input-table-edit"
                        />
                      </td>
                      <td>
                        <select
                          value={userRole}
                          onChange={(e) => handleUserChange(u._id, 'role', e.target.value)}
                          className="select-table-edit"
                        >
                          <option value="user">Estudiante (user)</option>
                          <option value="admin">Administrador (admin)</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn-save"
                          onClick={() => handleSaveUser(u._id, u.role, u.curso)}
                        >
                          Guardar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: AGREGAR LIBRO */}
      {activeTab === 'add-book' && (
        <div className="tab-content form-card">
          <h3>Registrar Nuevo Libro</h3>
          <form onSubmit={handleCreateBook} className="admin-form">
            <div className="form-group">
              <label>Título del Libro</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Cien Años de Soledad"
                required
              />
            </div>

            <div className="form-group">
              <label>Autor</label>
              <input
                type="text"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                placeholder="Ej. Gabriel García Márquez"
                required
              />
            </div>

            <div className="form-group">
              <label>Categoría</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="Literatura">Literatura</option>
                <option value="Religiosa">Religiosa</option>
                <option value="Ciencia">Ciencia</option>
                <option value="Historia">Historia</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Otro">Otro (Escribir...)</option>
              </select>
            </div>

            {categoria === 'Otro' && (
              <div className="form-group">
                <label>Escribe la Categoría</label>
                <input
                  type="text"
                  value={customCategoria}
                  onChange={(e) => setCustomCategoria(e.target.value)}
                  placeholder="Ej: Filosofía, Arte..."
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Clasificación Manual</label>
              <input
                type="text"
                value={clasificacion}
                onChange={(e) => setClasificacion(e.target.value)}
                placeholder="Ej: 823.91, FICCION"
              />
            </div>

            <div className="form-group">
              <label>Cantidad de Ejemplares (Stock)</label>
              <input
                type="number"
                min="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Sinopsis / Descripción</label>
              <textarea
                value={sinopsis}
                onChange={(e) => setSinopsis(e.target.value)}
                rows="4"
                placeholder="Escribe una breve sinopsis..."
                required
              />
            </div>

            <div className="form-group">
              <label>Portada (URL de la Imagen)</label>
              <input
                type="url"
                value={portadaUrl}
                onChange={(e) => setPortadaUrl(e.target.value)}
                placeholder="https://ejemplo.com/portada.jpg"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Libro'}
            </button>
          </form>
        </div>
      )}

      {/* PESTAÑA 4: CATÁLOGO DE LIBROS */}
      {activeTab === 'manage-books' && (
        <div className="tab-content">
          <h3>Gestión del Catálogo de Libros</h3>
          <div className="admin-books-grid">
            {books.map((book) => {
              const imgUrl = getBookCoverUrl(book);

              return (
                <div key={book._id} className="admin-book-card">
                  <div className="admin-book-cover-wrapper">
                    <img 
                      src={imgUrl} 
                      alt={book.titulo} 
                      className="admin-book-cover" 
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150x200?text=Sin+Portada'; }} 
                    />
                    <span className="stock-badge">
                      Ejemplares: {book.stock ?? book.ejemplares ?? 1}
                    </span>
                  </div>

                  <div className="admin-book-details">
                    <h4 className="admin-book-title">{book.titulo}</h4>
                    {book.autor && <p className="admin-book-author" style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: '2px 0' }}>✍️ {book.autor}</p>}
                    <p className="admin-book-synopsis">{book.sinopsis || book.descripcion}</p>
                    
                    <div className="book-meta-tags" style={{ display: 'flex', gap: '6px', margin: '8px 0', flexWrap: 'wrap' }}>
                      {book.categoria && <span style={{ background: '#334155', color: '#f8fafc', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px' }}>📂 {book.categoria}</span>}
                      {book.clasificacion && <span style={{ background: '#334155', color: '#f8fafc', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px' }}>🏷️ {book.clasificacion}</span>}
                    </div>

                    <button
                      className="btn-delete-book"
                      onClick={() => handleDeleteBook(book._id)}
                    >
                      🗑️ Eliminar Libro
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}