import { useEffect, useState } from 'react';
import { useAuthStore } from './useStore.js';
import { usersApi } from '../services/api.js';

export const useAuth = () => {
  const { user, token, isLoading, setUser, setIsLoading } = useAuthStore();
  const [error, setError] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Only fetch profile if we have a token but no user data
      if (token && !user && !authInitialized) {
        setIsLoading(true);
        try {
          const response = await usersApi.getProfile();
          setUser(response.data);
          setError(null);
        } catch (err) {
          console.error('Failed to load user profile:', err);
          setError('Failed to load user profile');
          // Don't clear user on error - keep the existing data
        } finally {
          setIsLoading(false);
        }
      }
      
      setAuthInitialized(true);
    };

    initAuth();
  }, [token]); // Only re-run when token changes

  return { user, token, isLoading, error };
};

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};
