import React from 'react';

/**
 * DataTable - Dynamic table that renders any columns/data
 * Displays results from query builder with pagination
 */
const DataTable = ({
  columns,
  rows,
  loading,
  pagination,
  total,
  onPageChange,
  showTechDetails,
}) => {
  if (!columns || !rows) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No data available
      </div>
    );
  }

  const totalPages = Math.ceil(total / pagination.limit);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                >
                  {col.replace(/([A-Z])/g, ' $1').trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50 transition">
                {columns.map((col) => (
                  <td
                    key={`${rowIdx}-${col}`}
                    className="px-6 py-4 text-sm text-gray-900 font-normal"
                  >
                    {formatCellValue(row[col] || row[col.toLowerCase()] || '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Page <span className="font-semibold">{pagination.page}</span> of{' '}
          <span className="font-semibold">{totalPages}</span> ({' '}
          <span className="font-semibold">{total}</span> total)
        </div>

        <div className="flex space-x-2">
          <button
            disabled={pagination.page === 1}
            onClick={() => onPageChange(pagination.page - 1)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-2 text-sm font-medium rounded ${
                  pageNum === pagination.page
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            disabled={pagination.page === totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-t-blue-500 border-gray-200 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Format cell values for display
 */
function formatCellValue(value) {
  if (value === null || value === undefined) return '-';

  // Format dates
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  // Format ISO date strings
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value).toLocaleDateString();
  }

  // Format numbers (currency or decimals)
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toFixed(2);
  }

  // Format booleans
  if (typeof value === 'boolean') {
    return value ? '✓ Yes' : '✗ No';
  }

  // Format arrays (show count)
  if (Array.isArray(value)) {
    return `[${value.length} items]`;
  }

  // Format objects (show summary)
  if (typeof value === 'object') {
    return `[Object]`;
  }

  return String(value);
}

export default DataTable;
