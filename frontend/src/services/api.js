import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors and unwrap response data
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  me: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  resetPassword: (id, password) => api.put(`/users/${id}/password`, { password }),
  delete: (id) => api.delete(`/users/${id}`),
};

// Worksite API
export const worksiteAPI = {
  getAll: (lat, lon) => api.get('/worksites', { params: { lat, lon } }),
  create: (data) => api.post('/worksites', data),
  update: (id, data) => api.put(`/worksites/${id}`, data),
  delete: (id) => api.delete(`/worksites/${id}`),
};

// Project API
export const projectAPI = {
  getAll: (worksiteId) => api.get('/projects', { params: { worksiteId } }),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Task API
export const taskAPI = {
  getAll: () => api.get('/tasks'),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// Time Entry API
export const timeEntryAPI = {
  getAll: (params) => api.get('/time-entries', { params }),
  getActive: () => api.get('/time-entries/active'),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'taskIds') {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/time-entries', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  clockOut: (id, data) => api.put(`/time-entries/${id}/clock-out`, data),
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'taskIds') {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/time-entries/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/time-entries/${id}`),
};

// Unified API object for components
const unifiedAPI = {
  auth: authAPI,
  users: userAPI,
  worksites: worksiteAPI,
  projects: projectAPI,
  tasks: taskAPI,
  timeEntries: timeEntryAPI,
};

export default unifiedAPI;
