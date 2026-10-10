import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Catalog.css';

export default function Catalog() {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para el cuadro modal personalizado
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' // 'success' o 'error'
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
        setModal({
          isOpen: true,
          title: 'Acceso requerido',
          message: 'Debes iniciar sesión para solicitar un libro.',
          type: 'error'
        });
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const body = {
        bookId: bookId,
        libroId: bookId,
        libro: bookId,
        userId: user?._id || user?.id,
        usuario: user?._id || user?.id
      };

      const res = await API.post('/loans', body, config);

      // Mostrar modal de éxito personalizado
      setModal({
        isOpen: true,
        title: '¡Solicitud Exitosa!',
        message: res.data?.mensaje || res.data?.message || 'Tu solicitud se ha enviado y está pendiente de aprobación.',
        type: 'success'
      });

      fetchBooks();
    } catch (err) {
      console.error('Error detallado al solicitar préstamo:', err);
      const msg = err.response?.data?.mensaje || err.response?.data?.error || err.response?.data?.message || 'No se pudo procesar la solicitud de préstamo.';
      
      // Mostrar modal de error personalizado
      setModal({
        isOpen: true,
        title: 'No se pudo completar',
        message: msg,
        type: 'error'
      });
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'success' });
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('¿Deseas eliminar este libro del catálogo?')) return;
    try {
      await API.delete(`/books/${bookId}`);
      fetchBooks();
    } catch (err) {
      console.error('Error al eliminar libro:', err);
      setModal({
        isOpen: true,
        title: 'Error',
        message: 'No se pudo intentar eliminar el libro.',
        type: 'error'
      });
    }
  };

  const getBookStock = (book) => {
    const count = book.ejemplares ?? book.copias ?? book.stock ?? 0;
    return parseInt(count, 10);
  };

  const getBookCoverUrl = (book) => {
    const rawPath = book?.portada || book?.portadaUrl || book?.imagen;
    if (!rawPath) return 'https://via.placeholder.com/150x200?text=Sin+Portada';

    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
      return rawPath;
    }

    const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    return `https://biblioteca-backend-9c1i.onrender.com${cleanPath}`;
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
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150x200?text=Sin+Portada';
                    }}
                  />
                </div>

                <div className="book-info">
                  <h3 className="book-title">{book.titulo}</h3>
                  <p className="book-author">{book.autor}</p>
                </div>

                <div className="book-actions">
                  {isAdmin ? (
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteBook(book._id)}
                    >
                      🗑️ Eliminar Libro
                    </button>
                  ) : (
                    <button
                      className="btn-primary"
                      onClick={() => handleRequestLoan(book._id)}
                      disabled={!isAvailable}
                    >
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

      {/* 🟢 CUADRO MODAL PERSONALIZADO */}
      {modal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className={`modal-icon ${modal.type}`}>
              {modal.type === 'success' ? '✅' : '⚠️'}
            </div>
            <h3>{modal.title}</h3>
            <p>{modal.message}</p>
            <button className="modal-btn" onClick={closeModal}>
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}