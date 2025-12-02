
import axios from 'axios';

function normalizeApiUrl(url) {
  if (!url || url.trim() === '') {
    // Fallback for local development if VITE_API_URL is not set in .env
    return 'http://localhost:5000/api';
  }
  // remove trailing slash(es)
  let u = url.trim().replace(/\/+$/, '');
  return u;
}

const API_BASE = normalizeApiUrl(import.meta.env.VITE_API_URL);

const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };


    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }


    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', (config.method || '').toUpperCase(), config.baseURL + (config.url || ''));
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV && response?.config?.metadata?.startTime) {
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
    }
    return response;
  },
  async (error) => {
    const originalConfig = error.config || {};
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
    }

    console.error('🚨 API Error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      url: originalConfig.baseURL ? `${originalConfig.baseURL}${originalConfig.url}` : originalConfig.url,
      method: originalConfig.method,
    });

    return Promise.reject(error);
  }
);

// Helper to inspect resolved API base during debugging
export function getResolvedApiBase() {
  return API_BASE;
}

export default axiosInstance;
