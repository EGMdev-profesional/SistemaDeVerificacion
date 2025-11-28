import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
};

// Admin
export const adminAPI = {
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (data) => api.put('/admin/profile', data),
  getAll: () => api.get('/admin'),
  create: (data) => api.post('/admin', data),
  update: (id, data) => api.put(`/admin/${id}`, data),
  delete: (id) => api.delete(`/admin/${id}`),
};

// Practicantes
export const practicanteAPI = {
  getAll: () => api.get('/practicantes'),
  getById: (id) => api.get(`/practicantes/${id}`),
  getByCodigo: (codigo) => api.get(`/practicantes/codigo/${codigo}`),
  create: (data) => api.post('/practicantes', data),
  update: (id, data) => api.put(`/practicantes/${id}`, data),
  delete: (id) => api.delete(`/practicantes/${id}`),
  getMyProfile: () => api.get('/practicantes/me'),
  updateMyProfile: (data) => api.put('/practicantes/me', data),
  // Use this to send multipart/form-data (with optional `foto` file)
  updateMyProfileForm: (formData) => api.put('/practicantes/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getNextCode: () => api.get('/practicantes/next-code'),
};

// Asistencias
export const asistenciaAPI = {
  registrar: (data) => api.post('/asistencias', data),
  getAll: (params) => api.get('/asistencias', { params }),
  getHoy: () => api.get('/asistencias/hoy'),
  getMiHistorial: () => api.get('/asistencias/mi-historial'),
  getHistorialPracticante: (id) => api.get(`/asistencias/practicante/${id}`),
  delete: (id) => api.delete(`/asistencias/${id}`),
};

// Reportes
export const reporteAPI = {
  getDashboard: () => api.get('/reportes/dashboard'),
  getTardanzas: (params) => api.get('/reportes/tardanzas', { params }),
  getSalidasTempranas: (params) => api.get('/reportes/salidas-tempranas', { params }),
  getGeneral: (params) => api.get('/reportes/general', { params }),
  getMisEstadisticas: () => api.get('/reportes/mis-estadisticas'),
  getEstadisticasPracticante: (id) => api.get(`/reportes/practicante/${id}`),
};

export default api;
