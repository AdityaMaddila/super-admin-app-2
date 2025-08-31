
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';// Port 3000 for backend

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication API calls
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }
};

// Super Admin API calls
export const superAdminAPI = {
  getUsers: async (params = {}) => {
    const response = await api.get('/superadmin/users', { params });
    return response.data;
  },
  

  getUserById: async (userId) => {
    const response = await api.get(`/superadmin/users/${userId}`);
    return { user: response.data }; 
  },
  
  getUser: async (userId) => {
    const response = await api.get(`/superadmin/users/${userId}`);
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/superadmin/users', userData);
    return response.data;
  },
  
  updateUser: async (userId, userData) => {
    const response = await api.put(`/superadmin/users/${userId}`, userData);
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/superadmin/users/${userId}`);
    return response.data;
  },
  
  // Roles
  getRoles: async () => {
    const response = await api.get('/superadmin/roles');
    return response.data;
  },
  
  createRole: async (roleData) => {
    const response = await api.post('/superadmin/roles', roleData);
    return response.data;
  },
  
  assignRole: async (userId, roleId) => {
    const response = await api.post('/superadmin/assign-role', { userId, roleId });
    return response.data;
  },
  
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/superadmin/audit-logs', { params });
    return response.data;
  },
  
  getAnalytics: async () => {
    const response = await api.get('/superadmin/analytics/summary');
    return response.data;
  }
};

export default api;