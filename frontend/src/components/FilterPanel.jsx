import React, { useState } from 'react';

/**
 * FilterPanel - Dynamic filter UI based on entity schema
 * Hides SQL complexity behind user-friendly filters
 */
const FilterPanel = ({
  entity,
  schema,
  currentState,
  onFilterChange,
  onIncludeChange,
  onSortChange,
  onViewModeChange,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    filters: true,
    relations: true,
    sort: true,
    view: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const entitySchema = schema?.entities[entity];
  if (!entitySchema) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* FILTERS SECTION */}
      {entitySchema.filters && entitySchema.filters.length > 0 && (
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('filters')}
            className="w-full p-4 flex justify-between items-center hover:bg-gray-50 font-semibold text-gray-900"
          >
            <span>🔍 Filters</span>
            <span>{expandedSections.filters ? '▼' : '▶'}</span>
          </button>
          {expandedSections.filters && (
            <div className="p-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entitySchema.filters.includes('status') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={currentState.filters.status || ''}
                    onChange={(e) => onFilterChange({ ...currentState.filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    {schema.filters.statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {entitySchema.filters.includes('priority') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={currentState.filters.priority || ''}
                    onChange={(e) => onFilterChange({ ...currentState.filters, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Priorities</option>
                    {schema.filters.priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {entitySchema.filters.includes('budgetMin') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Budget</label>
                    <input
                      type="number"
                      value={currentState.filters.budgetMin || ''}
                      onChange={(e) => onFilterChange({ ...currentState.filters, budgetMin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Budget</label>
                    <input
                      type="number"
                      value={currentState.filters.budgetMax || ''}
                      onChange={(e) => onFilterChange({ ...currentState.filters, budgetMax: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="999999"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* RELATIONS SECTION (Dynamic JOINs) */}
      {entitySchema.includes && entitySchema.includes.length > 0 && (
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('relations')}
            className="w-full p-4 flex justify-between items-center hover:bg-gray-50 font-semibold text-gray-900"
          >
            <span>🔗 Include Related Data</span>
            <span>{expandedSections.relations ? '▼' : '▶'}</span>
          </button>
          {expandedSections.relations && (
            <div className="p-4 border-t space-y-2">
              <p className="text-xs text-gray-500 mb-3">Select what additional information to include</p>
              {entitySchema.includes.map((relation) => (
                <label key={relation} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={currentState.include?.includes(relation) || false}
                    onChange={() => onIncludeChange(
                      currentState.include?.includes(relation)
                        ? currentState.include.filter((i) => i !== relation)
                        : [...(currentState.include || []), relation]
                    )}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {relation.charAt(0).toUpperCase() + relation.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SORT SECTION */}
      <div className="border rounded-lg">
        <button
          onClick={() => toggleSection('sort')}
          className="w-full p-4 flex justify-between items-center hover:bg-gray-50 font-semibold text-gray-900"
        >
          <span>📊 Sort</span>
          <span>{expandedSections.sort ? '▼' : '▶'}</span>
        </button>
        {expandedSections.sort && (
          <div className="p-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={currentState.sort?.field || 'createdAt'}
                onChange={(e) => onSortChange(e.target.value, currentState.sort?.order)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {entitySchema.fields.map((field) => (
                  <option key={field} value={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={currentState.sort?.order || 'asc'}
                onChange={(e) => onSortChange(currentState.sort?.field, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="asc">Ascending (A→Z)</option>
                <option value="desc">Descending (Z→A)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODE SECTION */}
      <div className="border rounded-lg">
        <button
          onClick={() => toggleSection('view')}
          className="w-full p-4 flex justify-between items-center hover:bg-gray-50 font-semibold text-gray-900"
        >
          <span>👁️ View Mode</span>
          <span>{expandedSections.view ? '▼' : '▶'}</span>
        </button>
        {expandedSections.view && (
          <div className="p-4 border-t grid grid-cols-1 md:grid-cols-3 gap-2">
            {['detailed', 'summary', 'analytics'].map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-4 py-2 rounded font-medium transition ${
                  currentState.viewMode === mode
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {mode === 'detailed'
                  ? '📋 Detailed'
                  : mode === 'summary'
                    ? '📊 Summary'
                    : '📈 Analytics'}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
