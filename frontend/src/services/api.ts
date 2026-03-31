/// <reference types="vite/client" />

import axios, { AxiosInstance, AxiosError } from 'axios';
import type { AuthResponse, User, Project, Task } from '../types/index';

/**
 * API Service with Production-Ready Configuration
 * Handles CORS, retries, error handling, and environment-specific URLs
 */

// Get API URL from environment or use default
const getApiUrl = (): string => {
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
const RETRY_DELAY = 1000; // ms

console.log(`[API] Initialized with Base URL: ${API_BASE_URL}`);

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials for CORS
  timeout: import.meta.env.VITE_REQUEST_TIMEOUT || 30000,
});

/**
 * Request Interceptor - Add auth token and handle request setup
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Log request in development
  if (import.meta.env.VITE_ENVIRONMENT !== 'production') {
    console.debug(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
  }

  return config;
});

/**
 * Response Interceptor - Handle errors, retries, and logging
 */
api.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (import.meta.env.VITE_ENVIRONMENT !== 'production') {
      console.debug(`[API Response] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as any;
    
    // increment retry count
    config.retryCount = (config.retryCount || 0) + 1;

    // Log error in development
    if (import.meta.env.VITE_ENVIRONMENT !== 'production') {
      console.error(`[API Error] ${error.message}`, {
        status: error.response?.status,
        url: config.url,
        retryCount: config.retryCount,
      });
    }

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject({
        message: 'Session expired. Please login again.',
        status: 401,
      });
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      return Promise.reject({
        message: 'Access denied',
        status: 403,
      });
    }

    // Handle CORS errors
    if (error.message === 'Network Error' && !error.response) {
      if (import.meta.env.VITE_ENVIRONMENT !== 'production') {
        console.error('[API CORS Error] Check your CORS configuration');
      }
      return Promise.reject({
        message: 'Network error. Please check your connection and CORS configuration.',
        status: 0,
      });
    }

    // Retry on 5xx errors (server errors)
    if (
      error.response?.status &&
      error.response.status >= 500 &&
      config.retryCount < MAX_RETRIES
    ) {
      await new Promise((resolve) => 
        setTimeout(resolve, RETRY_DELAY * config.retryCount)
      );
      return api(config);
    }

    // Return original error or formatted response
    return Promise.reject(
      error.response?.data || {
        message: error.message,
        status: error.response?.status || 0,
      }
    );
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/login', { email, password }),
  signup: (email: string, password: string, name: string) =>
    api.post<AuthResponse>('/api/auth/register', { email, password, name }),
  logout: () => {
    localStorage.removeItem('authToken');
  },
  getMe: () => api.get<User>('/api/auth/me'),
};

// Projects API
export const projectsApi = {
  getAll: () => api.get<Project[]>('/api/projects'),
  getById: (id: string) => api.get<Project>(`/api/projects/${id}`),
  create: (data: Partial<Project>) => api.post<Project>('/api/projects', data),
  update: (id: string, data: Partial<Project>) =>
    api.put<Project>(`/api/projects/${id}`, data),
  delete: (id: string) => api.delete(`/api/projects/${id}`),
};

// Tasks API
export const tasksApi = {
  getByProject: (projectId: string) =>
    api.get<Task[]>(`/api/projects/${projectId}/tasks`),
  create: (projectId: string, data: Partial<Task>) =>
    api.post<Task>(`/api/projects/${projectId}/tasks`, data),
  update: (projectId: string, taskId: string, data: Partial<Task>) =>
    api.put<Task>(`/api/projects/${projectId}/tasks/${taskId}`, data),
  delete: (projectId: string, taskId: string) =>
    api.delete(`/api/projects/${projectId}/tasks/${taskId}`),
};

// Users API
export const usersApi = {
  getProfile: () => api.get<User>('/api/users/profile'),
  updateProfile: (data: Partial<User>) =>
    api.put<User>('/api/users/profile', data),
};

export default api;
