import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Catalog.css';

export default function Catalog() {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  // Función corregida para procesar la solicitud de préstamo
  const handleRequestLoan = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Debes iniciar sesión para solicitar un libro');
        return;
      }

      // Configuración con el encabezado de autenticación JWT
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Compatibilidad con los campos que pueda requerir req.body en la API
      const body = {
        bookId: bookId,
        libroId: bookId,
        libro: bookId
      };

      const res = await API.post('/loans', body, config);

      alert(res.data?.mensaje || '✅ ¡Solicitud de préstamo realizada con éxito!');
      fetchBooks(); // Actualiza el catálogo para refrescar el stock disponible
    } catch (err) {
      console.error('Error al solicitar préstamo:', err);
      const mensajeError = 
        err.response?.data?.mensaje || 
        err.response?.data?.error || 
        'No se pudo procesar la solicitud de préstamo.';
      alert(`⚠️ Error: ${mensajeError}`);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('¿Deseas eliminar este libro del catálogo?')) return;
    try {
      await API.delete(`/books/${bookId}`);
      fetchBooks();
    } catch (err) {
      console.error('Error al eliminar libro:', err);
      alert('Error al intentar eliminar el libro.');
    }
  };

  // Obtención segura de las existencias del libro
  const getBookStock = (book) => {
    const count = book.ejemplares ?? book.copias ?? book.stock ?? 0;
    return parseInt(count, 10);
  };

  // Helper para construir la URL de la portada en Render o URLs externas
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
    </div>
  );
}