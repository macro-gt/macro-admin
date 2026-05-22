import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://macro-backend-v2.onrender.com';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const auth = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
};

export const dashboard = {
  get: () => api.get('/api/dashboard'),
};

export const clientes = {
  listar: () => api.get('/api/clientes'),
  crear: (data) => api.post('/api/clientes', data),
  actualizar: (id, data) => api.put(`/api/clientes/${id}`, data),
  eliminar: (id) => api.delete(`/api/clientes/${id}`),
};

export const pagos = {
  listar: () => api.get('/api/pagos'),
  crear: (data) => api.post('/api/pagos', data),
};

export default api;
