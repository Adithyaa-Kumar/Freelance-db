export const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} border-4 border-slate-200 dark:border-slate-700 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin`}
      />
    </div>
  );
};

export const ErrorAlert = ({ message, onDismiss }) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex justify-between items-center">
      <p className="text-red-700 dark:text-red-200">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-100"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export const SuccessAlert = ({ message, onDismiss }) => {
  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex justify-between items-center">
      <p className="text-green-700 dark:text-green-200">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100"
        >
          ✕
        </button>
      )}
    </div>
  );
};
