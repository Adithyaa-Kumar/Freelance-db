import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useAuthStore } from './useStore.js';

/**
 * useDataFetcher - Custom hook for smart data exploration
 * Prevents flickering by:
 * - Fetching schema only once
 * - Using useCallback to memoize fetch functions
 * - Proper dependency arrays to prevent infinite loops
 * - Debouncing API calls
 */
export const useDataFetcher = (initialEntity = 'projects') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schema, setSchema] = useState(null);
  const [insights, setInsights] = useState(null);

  const { token } = useAuthStore();
  const debounceTimerRef = useRef(null);
  const schemaFetchedRef = useRef(false);
  const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api';

  // Fetch schema only once when token changes
  useEffect(() => {
    if (!token || schemaFetchedRef.current) return;

    schemaFetchedRef.current = true;
    
    const fetchSchema = async () => {
      try {
        const response = await fetch(`${API_URL}/data/schema`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch schema');
        const result = await response.json();
        setSchema(result.schema);
      } catch (err) {
        console.error('Schema fetch error:', err);
        setError('Failed to load schema');
      }
    };

    fetchSchema();
  }, [token, API_URL]);

  /**
   * Fetch data with debouncing
   * Memoized to prevent unnecessary re-renders
   */
  const fetchData = useCallback(
    (queryParams) => {
      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (!token) {
        setError('No authentication token');
        return;
      }

      // Set debounce timer (300ms delay)
      debounceTimerRef.current = setTimeout(async () => {
        try {
          setLoading(true);
          setError(null);

          const response = await fetch(`${API_URL}/data/query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(queryParams),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Query failed');
          }

          const result = await response.json();
          setData(result.data);
          setError(null);
        } catch (err) {
          setError(err.message);
          console.error('Data fetch error:', err);
          setData(null);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [token, API_URL]
  );

  /**
   * Fetch insights for entity
   * Memoized to prevent unnecessary re-renders
   */
  const fetchInsights = useCallback(
    async (entity) => {
      if (!token) return;

      try {
        const response = await fetch(
          `${API_URL}/data/insights?entity=${entity}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch insights');
        const result = await response.json();
        setInsights(result.insights);
      } catch (err) {
        console.error('Insights fetch error:', err);
        setInsights(null);
      }
    },
    [token, API_URL]
  );

  /**
   * Save favorite query
   */
  const saveFavorite = useCallback(
    async (name, queryParams) => {
      try {
        const response = await fetch(`${API_URL}/data/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, params: queryParams }),
        });

        if (!response.ok) throw new Error('Failed to save favorite');
        return await response.json();
      } catch (err) {
        console.error('Save favorite error:', err);
        throw err;
      }
    },
    [token, API_URL]
  );

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return useMemo(
    () => ({
      data,
      loading,
      error,
      schema,
      insights,
      fetchData,
      fetchInsights,
      saveFavorite,
    }),
    [data, loading, error, schema, insights, fetchData, fetchInsights, saveFavorite]
  );
};

export default useDataFetcher;
