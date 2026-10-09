import React from 'react';
import './BookCard.css';

export default function BookCard({ book, onRequestLoan, isPending }) {
  const getImageUrl = (foto) => {
    if (!foto) return 'https://via.placeholder.com/150'; // Imagen por defecto si está vacía
    if (foto.startsWith('http')) {
      return foto; // Si es una URL externa (Imgur, Cloudinary, Web, etc.)
    }
    // Si es una ruta subida al backend en Render
    return `https://biblioteca-backend-9c1i.onrender.com${foto.startsWith('/') ? '' : '/'}${foto}`;
  };
  // Un libro está disponible si su stock es mayor a 0
  const isAvailable = book.stock > 0;

  return (
    <div className="book-card">
      <div className="book-cover-wrapper">
        <img
          src={getImageUrl(member.foto)}
          alt={member.nombre}
          className="team-photo"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/150'; // Fallback si la imagen no carga o caducó
          }}
        />
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