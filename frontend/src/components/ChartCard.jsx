export const ChartCard = ({
  title,
  description,
  children,
  icon,
  action,
}) => {
  return (
    <div
      className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/30 rounded-xl p-6 transition-all duration-300 hover:border-slate-600/50"
      style={{
        boxShadow: '0 0 20px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div
          className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5"
          style={{
            boxShadow: 'inset 0 1px 0 rgba(34, 211, 238, 0.2)',
          }}
        ></div>
      </div>

      <div className="relative z-10 flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {icon && <span className="text-xl">{icon}</span>}
            <h3 className="text-white font-semibold text-lg">{title}</h3>
          </div>
          {description && (
            <p className="text-slate-400 text-sm">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      <div className="relative z-10 h-px bg-gradient-to-r from-slate-700/50 via-slate-700/20 to-transparent mb-6"></div>

      <div className="relative z-10 overflow-x-auto">
        {children}
      </div>
    </div>
  );
};
