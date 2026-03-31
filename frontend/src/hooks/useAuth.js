import { useEffect, useState } from 'react';
import { useAuthStore } from './useStore.js';
import { usersApi } from '../services/api.js';

export const useAuth = () => {
  const { user, token, isLoading, setUser, setIsLoading } = useAuthStore();
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      if (token && !user) {
        setIsLoading(true);
        try {
          const response = await usersApi.getProfile();
          setUser(response.data);
        } catch (err) {
          setError('Failed to load user profile');
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initAuth();
  }, [token, user, setUser, setIsLoading]);

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
