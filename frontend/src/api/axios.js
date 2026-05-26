import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('amazon_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auto-logout on 401 — clears session and redirects to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we had a token (i.e. it expired/was tampered)
      const hadToken = !!sessionStorage.getItem('amazon_token');
      sessionStorage.removeItem('amazon_token');
      sessionStorage.removeItem('amazon_user');
      if (hadToken && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
