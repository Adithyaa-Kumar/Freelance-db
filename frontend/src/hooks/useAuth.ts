import { useEffect, useState } from 'react';
import { useAuthStore } from '@hooks/useStore';
import { usersApi } from '@services/api';

export const useAuth = () => {
  const { user, token, isLoading, setUser, setIsLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

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

export const useLocalStorage = (key: string, initialValue: unknown) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: unknown) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};
