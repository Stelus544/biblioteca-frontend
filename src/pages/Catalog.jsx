import React, { useState, useEffect } from 'react';
import API from '../services/api';
import BookCard from '../components/BookCard';
import './Catalog.css';

export default function Catalog() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [myPendingLoans, setMyPendingLoans] = useState([]);

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const fetchCatalogData = async () => {
    try {
      setLoading(true);
      const [booksRes, loansRes] = await Promise.all([
        API.get('/books'),
        API.get('/loans/my-loans')
      ]);

      setBooks(booksRes.data);
      // Extraemos los IDs de los libros que el usuario ya tiene solicitados en estado pendiente
      const pendingBookIds = loansRes.data
        .filter((loan) => loan.estado === 'pendiente')
        .map((loan) => loan.libro?._id || loan.libro);

      setMyPendingLoans(pendingBookIds);
    } catch (err) {
      setError('Error al cargar la información del catálogo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLoan = async (bookId) => {
    setMessage('');
    try {
      await API.post('/loans/request', { libroId: bookId });
      setMessage('¡Solicitud de préstamo enviada con éxito!');
      setMyPendingLoans([...myPendingLoans, bookId]);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al solicitar el préstamo');
    }
  };

  const filteredBooks = books.filter((book) =>
    book.titulo.toLowerCase().includes(search.toLowerCase()) ||
    book.sinopsis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="catalog-container">
      <header className="catalog-header">
        <div className="header-text">
          <h2>Catálogo de Libros</h2>
          <p>Explora la colección disponible y solicita tus lecturas</p>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por título o palabra clave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="catalog-loading">Cargando biblioteca...</div>
      ) : filteredBooks.length === 0 ? (
        <div className="catalog-empty">No se encontraron libros en el catálogo.</div>
      ) : (
        <div className="catalog-grid">
          {filteredBooks.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onRequestLoan={handleRequestLoan}
              isPending={myPendingLoans.includes(book._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}