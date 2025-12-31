import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Cambiar en producción
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: Inyectar Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Manejo de Errores Global (Token Expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el backend dice "Unauthorized", el token no sirve.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Redirección forzada
    }
    return Promise.reject(error);
  }
);

export default api;