export const StatCard = ({
  title,
  value,
  icon,
  trend,
  color = 'cyan',
}) => {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20',
    green: 'from-green-500/20 to-green-500/5 border-green-500/30 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-500/20',
    red: 'from-red-500/20 to-red-500/5 border-red-500/30 hover:border-red-400/50 hover:shadow-lg hover:shadow-red-500/20',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30 hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/20',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-500/20',
    indigo: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/30 hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/20',
  };

  const textClasses = {
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    green: 'text-green-400',
    red: 'text-red-400',
    orange: 'text-orange-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    indigo: 'text-indigo-400',
  };

  const trendClasses = {
    up: 'text-green-400',
    down: 'text-red-400',
  };

  return (
    <div
      className={`group relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 transition-all duration-300 cursor-pointer`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color].split(' ')[0]}`}></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-white">
                {typeof value === 'number'
                  ? value.toLocaleString()
                  : value}
              </h3>
              {trend && (
                <div className={`flex items-center gap-1 text-xs font-semibold ${trendClasses[trend.direction]}`}>
                  <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
                  <span>{Math.abs(trend.value)}%</span>
                </div>
              )}
            </div>
          </div>
          <div className={`text-3xl p-3 rounded-lg bg-slate-700/30 group-hover:bg-slate-600/40 transition-all`}>
            {icon}
          </div>
        </div>

        <div className={`h-1 w-12 bg-gradient-to-r from-current to-transparent rounded-full group-hover:w-24 transition-all duration-300 ${textClasses[color]}`}></div>
      </div>
    </div>
  );
};
