import React, { useState, useEffect } from 'react';
import API from '../services/api';
import CountdownTimer from '../components/CountdownTimer';
import './MyLoans.css';

export default function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyLoans();
  }, []);

  const fetchMyLoans = async () => {
    try {
      const response = await API.get('/loans/my-loans');
      setLoans(response.data);
    } catch (err) {
      setError('Error al cargar la lista de tus préstamos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-loans-container">
      <header className="my-loans-header">
        <h2>Mis Préstamos de Libros</h2>
        <p>Revisa el estado de tus solicitudes y el tiempo restante de tus lecturas activas</p>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loading-state">Cargando tus solicitudes...</div>
      ) : loans.length === 0 ? (
        <div className="empty-state">
          <p>Aún no has solicitado ningún libro.</p>
        </div>
      ) : (
        <div className="loans-list">
          {loans.map((loan) => {
            const book = loan.libro;
            const imageUrl = book?.portada?.startsWith('http')
              ? book.portada
              : `http://localhost:5000${book?.portada}`;

            return (
              <div key={loan._id} className="loan-card">
                <img src={imageUrl} alt={book?.titulo} className="loan-book-img" />
                
                <div className="loan-details">
                  <h3>{book?.titulo || 'Libro sin título'}</h3>
                  <p className="loan-date">
                    Solicitado el: {new Date(loan.fechaSolicitud).toLocaleDateString()}
                  </p>

                  <div className="loan-status-wrapper">
                    <span className={`status-badge ${loan.estado}`}>
                      {loan.estado}
                    </span>

                    {loan.estado === 'aprobado' && loan.fechaVencimiento && (
                      <CountdownTimer fechaVencimiento={loan.fechaVencimiento} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}