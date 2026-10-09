import axios from 'axios';

const API = axios.create({
  baseURL: 'https://biblioteca-backend-9c1i.onrender.com/api', // Cambia esto a la URL de tu backend
});

// Interceptor para enviar el token JWT guardado en localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;