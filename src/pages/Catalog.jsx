import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Catalog.css';

export default function Catalog() {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para modales de notificación
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  
  // Estado para el Modal de Edición de Libro
  const [editModal, setEditModal] = useState(false);
  const [currentBook, setCurrentBook] = useState({
    _id: '',
    titulo: '',
    autor: '',
    descripcion: '',
    categoria: 'Literatura',
    customCategoria: '',
    clasificacion: '',
    stock: 1,
    portada: ''
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await API.get('/books');
      setBooks(res.data || []);
    } catch (err) {
      console.error('Error al cargar libros:', err);
      setError('No se pudieron cargar los libros.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLoan = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setModal({ isOpen: true, title: 'Acceso requerido', message: 'Debes iniciar sesión para solicitar un libro.', type: 'error' });
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
      const body = { bookId, libroId: bookId, libro: bookId };

      const res = await API.post('/loans', body, config);
      setModal({ isOpen: true, title: '¡Solicitud Exitosa!', message: res.data?.mensaje || 'Tu solicitud se ha enviado con éxito.', type: 'success' });
      fetchBooks();
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'No se pudo procesar la solicitud.';
      setModal({ isOpen: true, title: 'No se pudo completar', message: msg, type: 'error' });
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('¿Deseas eliminar este libro del catálogo?')) return;
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModal({ isOpen: true, title: 'Eliminado', message: 'El libro fue eliminado correctamente.', type: 'success' });
      fetchBooks();
    } catch (err) {
      setModal({ isOpen: true, title: 'Error', message: 'No se pudo eliminar el libro.', type: 'error' });
    }
  };

  const openEditModal = (book) => {
    const predefinedCategories = ['Literatura', 'Religiosa', 'Ciencia', 'Historia', 'Tecnología'];
    const isCustom = book.categoria && !predefinedCategories.includes(book.categoria);

    setCurrentBook({
      _id: book._id,
      titulo: book.titulo || '',
      autor: book.autor || '',
      descripcion: book.descripcion || book.sinopsis || '',
      categoria: isCustom ? 'Otro' : (book.categoria || 'Literatura'),
      customCategoria: isCustom ? book.categoria : '',
      clasificacion: book.clasificacion || '',
      stock: book.stock ?? book.ejemplares ?? 1,
      portada: book.portada || ''
    });
    setEditModal(true);
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const finalCategoria = currentBook.categoria === 'Otro' ? currentBook.customCategoria : currentBook.categoria;

      const body = {
        titulo: currentBook.titulo,
        autor: currentBook.autor,
        descripcion: currentBook.descripcion,
        categoria: finalCategoria,
        clasificacion: currentBook.clasificacion,
        stock: Number(currentBook.stock),
        portada: currentBook.portada
      };

      const res = await API.put(`/books/${currentBook._id}`, body, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEditModal(false);
      setModal({ isOpen: true, title: 'Actualizado', message: res.data?.mensaje || 'El libro se ha actualizado correctamente.', type: 'success' });
      fetchBooks();
    } catch (err) {
      console.error('Error al actualizar:', err);
      setModal({ isOpen: true, title: 'Error', message: 'No se pudo actualizar la información del libro.', type: 'error' });
    }
  };

  const getBookStock = (book) => parseInt(book.stock ?? book.ejemplares ?? book.copias ?? 0, 10);

  // 🟢 FUNCIÓN CORREGIDA PARA LAS PORTADAS
  const getBookCoverUrl = (book) => {
    const rawPath = book?.portada || book?.portadaUrl || book?.imagen;
    if (!rawPath) return 'https://via.placeholder.com/150x200?text=Sin+Portada';
    
    // Si es un enlace web externo, úsalo tal cual
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
      return rawPath;
    }

    // Apunta directamente al backend en Render para evitar errores de conexión local
    const backendUrl = 'https://biblioteca-backend-9c1i.onrender.com';
    const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    return `${backendUrl}${cleanPath}`;
  };

  if (loading) return <div className="loading-spinner">Cargando catálogo...</div>;

  return (
    <div className="catalog-container">
      <header className="catalog-header">
        <h2>Catálogo de Libros</h2>
        <p>Explora y solicita libros disponibles en la biblioteca escolar</p>
      </header>

      {error && <div className="alert-danger">{error}</div>}

      <div className="books-grid">
        {books.length > 0 ? (
          books.map((book) => {
            const stock = getBookStock(book);
            const isAvailable = stock > 0;
            const isAdmin = user?.role === 'admin' || user?.rol === 'admin';

            return (
              <div key={book._id} className="book-card">
                <div className={`book-badge ${isAvailable ? 'badge-available' : 'badge-empty'}`}>
                  {isAvailable ? `Disponibles: ${stock}` : 'Agotado'}
                </div>

                <div className="book-cover-container">
                  <img
                    src={getBookCoverUrl(book)}
                    alt={book.titulo}
                    className="book-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150x200?text=Sin+Portada'; }}
                  />
                </div>

                <div className="book-info">
                  <h3 className="book-title">{book.titulo || 'Sin Título'}</h3>
                  <p className="book-author">✍️ {book.autor || 'Autor desconocido'}</p>
                  
                  {(book.descripcion || book.sinopsis) && (
                    <p className="book-description" style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0' }}>
                      {book.descripcion || book.sinopsis}
                    </p>
                  )}

                  <div className="book-meta-tags">
                    {book.categoria && <span className="book-category-tag">📂 {book.categoria}</span>}
                    {book.clasificacion && <span className="book-class-tag">🏷️ {book.clasificacion}</span>}
                  </div>
                </div>

                <div className="book-actions">
                  {isAdmin ? (
                    <div className="admin-btn-group">
                      <button className="btn-edit" onClick={() => openEditModal(book)}>✏️ Editar</button>
                      <button className="btn-delete" onClick={() => handleDeleteBook(book._id)}>🗑️ Eliminar</button>
                    </div>
                  ) : (
                    <button className="btn-primary" onClick={() => handleRequestLoan(book._id)} disabled={!isAvailable}>
                      {isAvailable ? 'Solicitar Préstamo' : 'Agotado'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-books">No hay libros registrados en el catálogo.</p>
        )}
      </div>

      {/* MODAL DE NOTIFICACIONES */}
      {modal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className={`modal-icon ${modal.type}`}>{modal.type === 'success' ? '✅' : '⚠️'}</div>
            <h3>{modal.title}</h3>
            <p>{modal.message}</p>
            <button className="modal-btn" onClick={() => setModal({ ...modal, isOpen: false })}>Aceptar</button>
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN DE LIBRO */}
      {editModal && (
        <div className="modal-overlay">
          <div className="modal-content edit-modal-box">
            <h3>Editar Libro</h3>
            <form onSubmit={handleUpdateBook} className="edit-form">
              <div className="form-group">
                <label>Título del Libro</label>
                <input 
                  type="text" 
                  value={currentBook.titulo} 
                  onChange={(e) => setCurrentBook({ ...currentBook, titulo: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Autor</label>
                <input 
                  type="text" 
                  value={currentBook.autor} 
                  onChange={(e) => setCurrentBook({ ...currentBook, autor: e.target.value })} 
                  placeholder="Ej: Akutami Gege"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Sinopsis / Descripción</label>
                <textarea 
                  rows="3"
                  value={currentBook.descripcion} 
                  onChange={(e) => setCurrentBook({ ...currentBook, descripcion: e.target.value })} 
                  placeholder="Escribe una breve sinopsis..."
                  style={{ background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', padding: '10px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select value={currentBook.categoria} onChange={(e) => setCurrentBook({ ...currentBook, categoria: e.target.value })}>
                  <option value="Literatura">Literatura</option>
                  <option value="Religiosa">Religiosa</option>
                  <option value="Ciencia">Ciencia</option>
                  <option value="Historia">Historia</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Otro">Otro (Escribir...)</option>
                </select>
              </div>

              {currentBook.categoria === 'Otro' && (
                <div className="form-group">
                  <label>Escribe la Categoría</label>
                  <input 
                    type="text" 
                    value={currentBook.customCategoria} 
                    onChange={(e) => setCurrentBook({ ...currentBook, customCategoria: e.target.value })} 
                    placeholder="Ej: Filosofía, Arte..." 
                    required 
                  />
                </div>
              )}

              <div className="form-group">
                <label>Clasificación Manual</label>
                <input 
                  type="text" 
                  value={currentBook.clasificacion} 
                  onChange={(e) => setCurrentBook({ ...currentBook, clasificacion: e.target.value })} 
                  placeholder="Ej: 823.91, FICCION" 
                />
              </div>

              <div className="form-group">
                <label>Ejemplares / Stock</label>
                <input 
                  type="number" 
                  min="0" 
                  value={currentBook.stock} 
                  onChange={(e) => setCurrentBook({ ...currentBook, stock: e.target.value })} 
                  required 
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">Guardar Cambios</button>
                <button type="button" className="btn-secondary" onClick={() => setEditModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}