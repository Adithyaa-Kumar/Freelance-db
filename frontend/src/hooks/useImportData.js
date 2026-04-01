import { useState, useCallback } from 'react';

/**
 * useImportData - Hook for importing sample data (DEO - Demo Export/Operations Data)
 * Handles API calls to seed the database with sample data for demonstration
 */
export const useImportData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Get token from localStorage or auth store
  const getToken = () => {
    try {
      const authState = localStorage.getItem('auth-store');
      if (authState) {
        const parsed = JSON.parse(authState);
        return parsed.state?.token;
      }
    } catch (e) {
      console.error('Failed to get token from localStorage:', e);
    }
    return null;
  };

  const importData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const token = getToken();
      if (!token) {
        throw new Error('Not authenticated. Please login first.');
      }

      const response = await fetch(`${API_URL}/seed/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import data');
      }

      const result = await response.json();
      setSuccess(true);

      return result.data;
    } catch (err) {
      setError(err.message);
      console.error('Data import error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    importData,
    loading,
    error,
    success,
    clearMessages,
  };
};

export default useImportData;
