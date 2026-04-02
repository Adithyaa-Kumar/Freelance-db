export const StatCard = ({
  title,
  value,
  icon,
  trend,
  color = 'blue',
}) => {
  const gradients = {
    blue: {
      gradient: 'from-blue-50 to-blue-100/50',
      border: 'border-blue-200',
      icon: 'bg-blue-100',
      accent: 'text-blue-600',
    },
    indigo: {
      gradient: 'from-indigo-50 to-indigo-100/50',
      border: 'border-indigo-200',
      icon: 'bg-indigo-100',
      accent: 'text-indigo-600',
    },
    yellow: {
      gradient: 'from-yellow-50 to-yellow-100/50',
      border: 'border-yellow-200',
      icon: 'bg-yellow-100',
      accent: 'text-yellow-600',
    },
    green: {
      gradient: 'from-green-50 to-green-100/50',
      border: 'border-green-200',
      icon: 'bg-green-100',
      accent: 'text-green-600',
    },
    purple: {
      gradient: 'from-purple-50 to-purple-100/50',
      border: 'border-purple-200',
      icon: 'bg-purple-100',
      accent: 'text-purple-600',
    },
    red: {
      gradient: 'from-red-50 to-red-100/50',
      border: 'border-red-200',
      icon: 'bg-red-100',
      accent: 'text-red-600',
    },
    orange: {
      gradient: 'from-orange-50 to-orange-100/50',
      border: 'border-orange-200',
      icon: 'bg-orange-100',
      accent: 'text-orange-600',
    },
    cyan: {
      gradient: 'from-cyan-50 to-cyan-100/50',
      border: 'border-cyan-200',
      icon: 'bg-cyan-100',
      accent: 'text-cyan-600',
    },
  };

  const theme = gradients[color] || gradients.blue;

  return (
    <div
      className={`group relative overflow-hidden bg-gradient-to-br ${theme.gradient} border ${theme.border} rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100 cursor-pointer`}
    >
      {/* Background accent */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-4xl font-bold ${theme.accent}`}>
                {typeof value === 'number'
                  ? value.toLocaleString()
                  : value}
              </h3>
              {trend && (
                <div
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                    trend.direction === 'up'
                      ? 'text-green-600 bg-green-100'
                      : 'text-red-600 bg-red-100'
                  }`}
                >
                  <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
                  <span>{Math.abs(trend.value)}%</span>
                </div>
              )}
            </div>
          </div>
          <div className={`text-3xl p-3 rounded-lg ${theme.icon} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          className={`h-1 w-12 bg-gradient-to-r ${theme.accent.replace('text-', 'from-')} to-transparent rounded-full group-hover:w-24 transition-all duration-300 opacity-70`}
        />
      </div>
    </div>
  );
};
