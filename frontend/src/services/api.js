import axios from 'axios';

/**
 * API Service with Production-Ready Configuration
 * Handles CORS, retries, error handling, and environment-specific URLs
 */

// Get API URL from environment or use default
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envUrl) {
    console.debug(`[API] Using API URL from environment: ${envUrl}`);
    return envUrl;
  }

  // Fallback based on current location
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      return 'http://localhost:5000';
    }
    
    // Production: assume API is on same domain
    return `${window.location.protocol}//${window.location.host}`;
  }

  return 'http://localhost:5000';
};

const API_BASE_URL = getApiUrl();
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

console.log(`[API] Initialized with Base URL: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: import.meta.env.VITE_REQUEST_TIMEOUT || 30000,
});

/**
 * Request Interceptor - Add auth token and handle request setup
 */
api.interceptors.request.use((config) => {
  // Try to get token from localStorage first (from Zustand persist)
  try {
    const authStorage = localStorage.getItem('auth-storage');
    let token = null;
    
    if (authStorage) {
      try {
        const authState = JSON.parse(authStorage);
        token = authState.state?.token || authState.token;
      } catch (e) {
        console.error('Failed to parse auth storage:', e);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (import.meta.env.VITE_ENVIRONMENT !== 'production') {
        console.debug(`[API Request] Auth header added`);
      }
    }
  } catch (e) {
    console.error('Error reading auth token:', e);
  }

  if (import.meta.env.VITE_ENVIRONMENT !== 'production') {
    console.debug(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
  }

  return config;
});

/**\n * Response Interceptor - Handle errors, retries, and logging
 */
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_ENVIRONMENT !== 'production') {
      console.debug(`[API Response] ${response.status} ${response.config.url}`);
    }
    
    console.log('[API Response Interceptor] Full response:', response);
    console.log('[API Response Interceptor] response.data:', response.data);
    
    // Unwrap the data if it's in the expected format
    if (response.data?.data && response.data?.success !== false) {
      console.log('[API Response Interceptor] Unwrapping nested data');
      response.data = response.data.data;
    }
    
    return response;
  },
  async (error) => {
    const config = error.config;
    
    config.retryCount = (config.retryCount || 0) + 1;

    if (import.meta.env.VITE_ENVIRONMENT !== 'production') {
      console.error(`[API Error] ${error.message}`, {
        status: error.response?.status,
        url: config.url,
        retryCount: config.retryCount,
      });
    }

    if (error.response?.status === 401) {
      // Clear auth state for 401 errors
      try {
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      } catch (e) {
        // ignore
      }
      window.location.href = '/login';
      return Promise.reject({
        message: 'Session expired. Please login again.',
        status: 401,
      });
    }

    if (error.response?.status === 403) {
      return Promise.reject({
        message: 'Access denied',
        status: 403,
      });
    }

    if (error.message === 'Network Error' && !error.response) {
      if (import.meta.env.VITE_ENVIRONMENT !== 'production') {
        console.error('[API CORS Error] Check your CORS configuration');
      }
      return Promise.reject({
        message: 'Network error. Please check your connection and CORS configuration.',
        status: 0,
      });
    }

    if (config.retryCount < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * config.retryCount));
      return api.request(config);
    }

    return Promise.reject(error);
  }
);

/**
 * Authentication API
 */
export const authApi = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
  signup: (email, password, name) =>
    api.post('/api/auth/register', { email, password, name }),
  getProfile: () =>
    api.get('/api/auth/me'),
  updateProfile: (data) =>
    api.put('/api/auth/profile', data),
};

/**
 * Projects API
 */
export const projectsApi = {
  getAllProjects: () =>
    api.get('/api/projects'),
  getProjectById: (id) =>
    api.get(`/api/projects/${id}`),
  createProject: (data) =>
    api.post('/api/projects', data),
  updateProject: (id, data) =>
    api.put(`/api/projects/${id}`, data),
  deleteProject: (id) =>
    api.delete(`/api/projects/${id}`),
};

/**
 * Tasks API
 */
export const tasksApi = {
  getTasksByProject: (projectId) =>
    api.get(`/api/projects/${projectId}/tasks`),
  createTask: (projectId, data) =>
    api.post(`/api/projects/${projectId}/tasks`, data),
  updateTask: (projectId, taskId, data) =>
    api.put(`/api/projects/${projectId}/tasks/${taskId}`, data),
  deleteTask: (projectId, taskId) =>
    api.delete(`/api/projects/${projectId}/tasks/${taskId}`),
};

/**
 * Users API (use authApi for profile endpoints instead)
 */
export const usersApi = {
  getProfile: () => authApi.getProfile(),
  updateProfile: (data) => authApi.updateProfile(data),
};

/**
 * Analytics API
 */
export const analyticsApi = {
  getStats: () =>
    api.get('/api/analytics/stats'),
  getRevenueData: () =>
    api.get('/api/analytics/revenue'),
  getProjectStats: () =>
    api.get('/api/analytics/projects'),
};

/**
 * Health check
 */
export const healthApi = {
  check: () =>
    api.get('/api/health'),
};

export default api;
