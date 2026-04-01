import React, { useState, useEffect, useRef } from 'react';
import useDataFetcher from '@hooks/useDataFetcher.js';
import { QueryStateManager } from '@utils/queryStateManager.js';
import SmartDataTable from './SmartDataTable.jsx';
import FilterPanel from './FilterPanel.jsx';

/**
 * SmartDataExplorer - Main component for smart data exploration
 * Connects UI state management with dynamic SQL queries
 */
const SmartDataExplorer = ({ entity = 'projects' }) => {
  const { data, loading, error, schema, insights, fetchData, fetchInsights } = useDataFetcher(entity);
  const [queryState, setQueryState] = useState(new QueryStateManager({ entity }));
  const [showTechDetails, setShowTechDetails] = useState(false);
  const initializedRef = useRef(false); // Prevent duplicate initialization

  // Initialize on mount - ONLY ONCE per entity change
  useEffect(() => {
    if (initializedRef.current && queryState.getState().entity === entity) return;
    
    initializedRef.current = true;
    setQueryState(new QueryStateManager({ entity }));
    fetchInsights(entity);
    // Don't fetch data here - let the state change trigger it
  }, [entity]); // Only depend on entity

  // Execute query whenever state changes
  useEffect(() => {
    const currentState = queryState.getState();
    fetchData(currentState);
  }, [queryState.getState()]); // This will cause updates when state changes

  const handleFilterChange = (filters) => {
    setQueryState((prev) => {
      const newState = new QueryStateManager(prev.getState());
      newState.setFilters(filters);
      return newState;
    });
  };

  const handleIncludeChange = (includes) => {
    setQueryState((prev) => {
      const newState = new QueryStateManager(prev.getState());
      newState.setInclude(includes);
      return newState;
    });
  };

  const handleSortChange = (field, order) => {
    setQueryState((prev) => {
      const newState = new QueryStateManager(prev.getState());
      newState.setSort(field, order);
      return newState;
    });
  };

  const handleViewModeChange = (mode) => {
    setQueryState((prev) => {
      const newState = new QueryStateManager(prev.getState());
      newState.setViewMode(mode);
      return newState;
    });
  };

  const handlePageChange = (page) => {
    setQueryState((prev) => {
      const newState = new QueryStateManager(prev.getState());
      newState.setPage(page);
      return newState;
    });
  };

  const currentState = queryState.getState();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {schema?.entities[entity]?.displayName || 'Data Explorer'}
          </h1>
          <button
            onClick={() => setShowTechDetails(!showTechDetails)}
            className="px-3 py-1 text-xs font-mono bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
          >
            {showTechDetails ? '👁️ Hide Details' : '🔧 Dev Mode'}
          </button>
        </div>

        {/* Insights */}
        {insights && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900 font-semibold mb-2">💡 Insights & Tips</p>
            <ul className="text-sm text-blue-800 space-y-1">
              {insights.recommendedActions?.slice(0, 3).map((action, idx) => (
                <li key={idx}>• {action}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Filter & Controls Panel */}
      <FilterPanel
        entity={entity}
        schema={schema}
        currentState={currentState}
        onFilterChange={handleFilterChange}
        onIncludeChange={handleIncludeChange}
        onSortChange={handleSortChange}
        onViewModeChange={handleViewModeChange}
      />

      {/* Data Table or Loading/Error */}
      <div className="mt-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-900 font-semibold">❌ Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <>
            <SmartDataTable
              columns={data.columns}
              rows={data.rows}
              loading={loading}
              pagination={data.pagination}
              total={data.total}
              onPageChange={handlePageChange}
              showTechDetails={showTechDetails}
            />

            {/* Tech Details (Dev Mode) */}
            {showTechDetails && (
              <div className="mt-6 bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-auto max-h-48">
                <p className="text-yellow-300 font-bold mb-2">📊 Query Parameters (Dev Mode)</p>
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(currentState, null, 2)}
                </pre>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default SmartDataExplorer;
