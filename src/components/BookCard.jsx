import React from 'react';
import './BookCard.css';

export default function BookCard({ book, onRequestLoan, isPending }) {
  const imageUrl = book.portada.startsWith('http')
    ? book.portada
    : `http://localhost:5000${book.portada}`;

  // Un libro está disponible si su stock es mayor a 0
  const isAvailable = book.stock > 0;

  return (
    <div className="book-card">
      <div className="book-cover-wrapper">
        <img src={imageUrl} alt={book.titulo} className="book-cover" />
        <span className={`status-badge ${isAvailable ? 'available' : 'unavailable'}`}>
          {isAvailable ? `Disponibles: ${book.stock}` : 'Agotado'}
        </span>
      </div>

      <div className="book-content">
        <h3 className="book-title">{book.titulo}</h3>
        <p className="book-synopsis">{book.sinopsis}</p>

        <div className="book-actions">
          <button
            className={`btn-request ${!isAvailable || isPending ? 'disabled' : ''}`}
            onClick={() => onRequestLoan(book._id)}
            disabled={!isAvailable || isPending}
          >
            {isPending
              ? 'Solicitud Enviada'
              : isAvailable
              ? 'Solicitar Préstamo'
              : 'Agotado'}
          </button>
        </div>
      </div>
    </div>
  );
}