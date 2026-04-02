export const ChartCard = ({
  title,
  description,
  children,
  icon,
  action,
}) => {
  return (
    <div
      className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 transition-all duration-300 hover:border-gray-300 hover:shadow-lg shadow-sm"
    >
      {/* Subtle background accent */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500" />
      </div>

      <div className="relative z-10 flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <h3 className="text-gray-900 font-semibold text-lg">{title}</h3>
          </div>
          {description && (
            <p className="text-gray-600 text-sm">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      <div className="relative z-10 h-px bg-gradient-to-r from-gray-300 via-gray-200 to-transparent mb-6" />

      <div className="relative z-10 overflow-x-auto">
        {children}
      </div>
    </div>
  );
};
