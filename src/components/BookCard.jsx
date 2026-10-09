import React from 'react';

export default function TeamCard({ member, onDelete }) {
  // Construir la URL completa apuntando al servidor de Render
  const getPhotoUrl = (foto) => {
    if (!foto) return 'https://via.placeholder.com/150';
    if (foto.startsWith('http')) return foto;
    
    // Si es un archivo local guardado por Multer
    const BACKEND_URL = 'https://biblioteca-backend-9c1i.onrender.com';
    return `${BACKEND_URL}${foto.startsWith('/') ? '' : '/'}${foto}`;
  };

  return (
    <div className="team-card">
      <div className="team-photo-container">
        <img
          src={getPhotoUrl(member.foto)}
          alt={member.nombre}
          className="team-photo"
          onError={(e) => {
            // Evita bucles infinitos y muestra una imagen de reemplazo si falla
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/150';
          }}
        />
      </div>
      <h3 className="team-name">{member.nombre}</h3>
      <p className="team-role">{member.cargo}</p>
      {onDelete && (
        <button className="btn-delete" onClick={() => onDelete(member._id)}>
          Eliminar
        </button>
      )}
    </div>
  );
}