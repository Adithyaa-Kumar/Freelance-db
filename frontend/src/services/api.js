import axios from 'axios';

/**
 * Production-Ready API Service
 * - Fixed API base URL logic (always prioritize VITE_API_BASE_URL)
 * - Improved error handling (network errors vs real errors)
 * - Proper CORS error distinction
 * - Console logging for debugging
 */

// ============ CONFIGURATION ============

/**
 * Get API base URL
 * Priority: VITE_API_BASE_URL env var > default
 * DO NOT fallback to window.location in production
 */
function getApiUrl() {
  // Always use environment variable if set
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envUrl) {
    console.log('[API] Using VITE_API_BASE_URL:', envUrl);
    return envUrl;
  }

  // Development only: use localhost
  if (import.meta.env.VITE_ENVIRONMENT === 'development') {
    const devUrl = 'http://localhost:5000';
    console.warn('[API] Using development default:', devUrl);
    return devUrl;
  }

  // If no env URL in production, throw error
  console.error('[API] ERROR: VITE_API_BASE_URL not set in production');
  throw new Error('API_BASE_URL is required in production. Check your Cloudflare Pages environment variables.');
}

const API_BASE_URL = getApiUrl();
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

console.log('[API] Service initialized', {
  baseURL: API_BASE_URL,
  environment: import.meta.env.VITE_ENVIRONMENT,
  mode: import.meta.env.MODE,
});

// ============ AXIOS INSTANCE ============

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ============ REQUEST INTERCEPTOR ============

/**
 * Add Authorization header and log requests
 */
api.interceptors.request.use(
  (config) => {
    const method = config.method?.toUpperCase() || 'UNKNOWN';
    const url = config.url || 'unknown';

    console.log(`[API Request] ${method} ${API_BASE_URL}${url}`);

    // Add auth token if available
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authState = JSON.parse(authStorage);
        const token = authState.state?.token || authState.token;

        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
          console.log('[API Request] Authorization header added');
        }
      }
    } catch (error) {
      console.warn('[API Request] Could not read auth token:', error.message);
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// ============ RESPONSE INTERCEPTOR ============

/**
 * Handle responses and errors with proper categorization
 */
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`, {
      dataKeys: Object.keys(response.data || {}),
    });

    // Unwrap nested data structure { success, data: {...} }
    if (response.data?.success && response.data?.data) {
      response.data = response.data.data;
    }

    return response;
  },
  async (error) => {
    const config = error.config || {};
    config.retryCount = (config.retryCount || 0) + 1;

    const errorInfo = {
      message: error.message,
      status: error.response?.status || 0,
      url: config.url,
      retryCount: config.retryCount,
      responseStatus: error.response?.statusText,
    };

    console.error('[API Response Error]', errorInfo);

    // ========== ERROR CATEGORIZATION ==========

    // 1. Network Error (no response from server)
    if (!error.response && error.message === 'Network Error') {
      console.error('[API NETWORK ERROR] Server unreachable or CORS blocked');
      console.error('[API DEBUG] Check:', {
        apiUrl: API_BASE_URL,
        corsOrigin: 'Check Cloudflare Worker CORS_ORIGIN setting',
        frontendUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
      });

      return Promise.reject({
        type: 'NETWORK_ERROR',
        message: `Cannot reach API server at ${API_BASE_URL}. Check CORS configuration.`,
        originalError: error,
      });
    }

    // 2. Request Timeout
    if (error.code === 'ECONNABORTED') {
      console.error('[API TIMEOUT] Request exceeded 30s timeout');

      return Promise.reject({
        type: 'TIMEOUT_ERROR',
        message: 'Request timed out. Server may be slow or unreachable.',
        originalError: error,
      });
    }

    // 3. 401 Unauthorized - Session expired
    if (error.response?.status === 401) {
      console.warn('[API AUTH ERROR] Session expired (401)');

      // Clear auth storage
      try {
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('authToken');
      } catch (e) {
        console.warn('Could not clear auth storage:', e);
      }

      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      return Promise.reject({
        type: 'AUTH_ERROR',
        message: 'Session expired. Please log in again.',
        status: 401,
      });
    }

    // 4. 403 Forbidden - Access denied
    if (error.response?.status === 403) {
      console.error('[API PERMISSION ERROR] Access forbidden (403)');

      return Promise.reject({
        type: 'PERMISSION_ERROR',
        message: 'You do not have permission to access this resource.',
        status: 403,
      });
    }

    // 5. 5xx Server Error
    if (error.response?.status >= 500) {
      console.error('[API SERVER ERROR]', error.response.status, error.response.data);

      return Promise.reject({
        type: 'SERVER_ERROR',
        message: `Server error: ${error.response.status} ${error.response.statusText}`,
        status: error.response.status,
        responseData: error.response.data,
      });
    }

    // 6. 4xx Client Error (except 401, 403)
    if (error.response?.status >= 400) {
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        `Client error: ${error.response.status}`;

      console.error('[API CLIENT ERROR]', error.response.status, errorMessage);

      return Promise.reject({
        type: 'CLIENT_ERROR',
        message: errorMessage,
        status: error.response.status,
        responseData: error.response.data,
      });
    }

    // ========== RETRY LOGIC ==========

    if (config.retryCount < MAX_RETRIES && error.response?.status >= 500) {
      console.log(`[API Retry] Attempt ${config.retryCount}/${MAX_RETRIES}`);
      const delay = RETRY_DELAY * config.retryCount;

      await new Promise((resolve) => setTimeout(resolve, delay));
      return api.request(config);
    }

    // Return normalized error
    return Promise.reject({
      type: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      status: error.response?.status || 0,
      originalError: error,
    });
  }
);

// ============ API ENDPOINTS ============

/**
 * Authentication endpoints
 */
export const authApi = {
  login: (email, password) => {
    console.log('[Auth] Login attempt:', email);
    return api.post('/auth/login', { email, password });
  },

  signup: (email, password, name) => {
    console.log('[Auth] Signup attempt:', email);
    return api.post('/auth/register', { email, password, name });
  },

  getProfile: () => {
    console.log('[Auth] Fetching profile');
    return api.get('/auth/me');
  },

  updateProfile: (data) => {
    console.log('[Auth] Updating profile');
    return api.put('/auth/profile', data);
  },

  logout: () => {
    console.log('[Auth] Logout');
    try {
      localStorage.removeItem('auth-storage');
      localStorage.removeItem('authToken');
    } catch (e) {
      console.warn('Could not clear auth on logout:', e);
    }
  },
};

/**
 * Projects endpoints
 */
export const projectsApi = {
  getAll: () => {
    console.log('[Projects] Fetching all projects');
    return api.get('/projects');
  },

  getById: (id) => {
    console.log('[Projects] Fetching project:', id);
    return api.get(`/projects/${id}`);
  },

  create: (data) => {
    console.log('[Projects] Creating project');
    return api.post('/projects', data);
  },

  update: (id, data) => {
    console.log('[Projects] Updating project:', id);
    return api.put(`/projects/${id}`, data);
  },

  delete: (id) => {
    console.log('[Projects] Deleting project:', id);
    return api.delete(`/projects/${id}`);
  },
};

/**
 * Tasks endpoints
 */
export const tasksApi = {
  getByProject: (projectId) => {
    console.log('[Tasks] Fetching tasks for project:', projectId);
    return api.get(`/projects/${projectId}/tasks`);
  },

  create: (projectId, data) => {
    console.log('[Tasks] Creating task');
    return api.post(`/projects/${projectId}/tasks`, data);
  },

  update: (projectId, taskId, data) => {
    console.log('[Tasks] Updating task:', taskId);
    return api.put(`/projects/${projectId}/tasks/${taskId}`, data);
  },

  delete: (projectId, taskId) => {
    console.log('[Tasks] Deleting task:', taskId);
    return api.delete(`/projects/${projectId}/tasks/${taskId}`);
  },
};

/**
 * Analytics endpoints
 */
export const analyticsApi = {
  getDashboard: () => {
    console.log('[Analytics] Fetching dashboard data');
    return api.get('/analytics/dashboard');
  },

  getStats: () => {
    console.log('[Analytics] Fetching stats');
    return api.get('/analytics/stats');
  },

  getRevenue: () => {
    console.log('[Analytics] Fetching revenue');
    return api.get('/analytics/revenue');
  },
};

/**
 * Health check
 */
export const healthApi = {
  check: () => {
    console.log('[Health] Checking API health');
    return api.get('/health');
  },
};

/**
 * Debug utilities
 */
export const debugApi = {
  getConfig: () => ({
    baseURL: API_BASE_URL,
    environment: import.meta.env.VITE_ENVIRONMENT,
    timeout: 30000,
    apiVersion: '1.0.0',
  }),

  testConnection: async () => {
    try {
      console.log('[Debug] Testing connection to:', API_BASE_URL);
      const response = await healthApi.check();
      console.log('[Debug] Health check passed:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[Debug] Health check failed:', error);
      return { success: false, error };
    }
  },
};

export default api;

