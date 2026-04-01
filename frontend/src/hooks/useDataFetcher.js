import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from './useStore.js';

/**
 * useDataFetcher - Custom hook for smart data exploration
 * Handles API calls with debouncing, loading states, and error handling
 */
export const useDataFetcher = (initialEntity = 'projects') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schema, setSchema] = useState(null);
  const [insights, setInsights] = useState(null);

  const { token } = useAuthStore();
  const debounceTimerRef = useRef(null);
  const schemaFetchedRef = useRef(false); // Prevent duplicate schema fetches
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch schema once on mount
  useEffect(() => {
    if (schemaFetchedRef.current || !token) return;
    
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
      }
    };

    fetchSchema();
  }, []); // Empty dependency array - fetch only once

  /**
   * Execute query with smart SQL generation
   * Debounced to prevent excessive API calls
   */
  const fetchData = useCallback(
    (queryParams) => {
      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set debounce timer
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
        } catch (err) {
          setError(err.message);
          console.error('Data fetch error:', err);
        } finally {
          setLoading(false);
        }
      }, 500); // 500ms debounce
    },
    [token]
  );

  /**
   * Fetch insights for specific entity
   */
  const fetchInsights = useCallback(
    async (entity) => {
      try {
        const response = await fetch(`${API_URL}/data/insights/${entity}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch insights');
        const result = await response.json();
        setInsights(result.insights);
      } catch (err) {
        console.error('Insights fetch error:', err);
      }
    },
    [token]
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
    [token]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    schema,
    insights,
    fetchData,
    fetchInsights,
    saveFavorite,
  };
};

export default useDataFetcher;
