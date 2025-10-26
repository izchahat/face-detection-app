import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Face Detection endpoints
export const faceAPI = {
  detect: (data) => api.post('/facedetect/detect', data),
  getHistory: (userId) => api.get(`/facedetect/history/${userId}`),
  deleteDetection: (detectionId) => api.delete(`/facedetect/delete/${detectionId}`),
};

export default api;