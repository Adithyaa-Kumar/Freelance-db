import React, { useState } from 'react';
import useImportData from '@hooks/useImportData.js';

/**
 * ImportDataButton - Reusable component for importing DEO (Demo Export/Operations) data
 * Provides visual feedback with loading and success states
 */
const ImportDataButton = ({ onSuccess = null, className = '' }) => {
  const { importData, loading, error, success, clearMessages } = useImportData();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleImport = async () => {
    try {
      const result = await importData();
      setShowConfirm(false);

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        clearMessages();
      }, 5000);

      // Call callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error('Import failed:', err);
    }
  };

  if (success) {
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-lg text-green-800 font-medium ${className}`}>
        <span>✓</span>
        <span>DEO Data Imported!</span>
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-gray-700">Clear existing data and import?</span>
        <button
          onClick={handleImport}
          disabled={loading}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded-md transition-colors"
        >
          {loading ? 'Importing...' : 'Confirm'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm rounded-md transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors ${
          className
        }`}
        title="Import demo data with projects, tasks, payments, and clients"
      >
        <span>📥</span>
        <span>{loading ? 'Importing...' : 'Import DEO Data'}</span>
      </button>

      {error && (
        <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm animate-pulse">
          <p className="font-semibold">❌ Import Failed</p>
          <p>{error}</p>
        </div>
      )}
    </>
  );
};

export default ImportDataButton;
