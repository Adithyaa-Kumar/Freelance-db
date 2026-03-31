import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@hooks/useStore.js';

export const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Clients', icon: '👥', path: '/clients' },
    { label: 'Projects', icon: '📋', path: '/projects' },
    { label: 'Payments', icon: '💰', path: '/payments' },
    { label: 'Tasks', icon: '✓', path: '/tasks' },
    { label: 'Analytics', icon: '📈', path: '/analytics' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 transition-all duration-300 z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-700/30">
        {!isCollapsed && (
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-white group">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center text-lg font-bold group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-shadow">
              FF
            </div>
            <span className="text-lg">FreelanceFlow</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 relative group ${
              isActive(item.path)
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
            }`}
            title={isCollapsed ? item.label : ''}
          >
            {isActive(item.path) && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-purple-600 rounded-r-lg shadow-lg shadow-cyan-500/50"></div>
            )}

            <span className="text-xl flex-shrink-0">{item.icon}</span>
            {!isCollapsed && <span className="font-medium">{item.label}</span>}

            {!isActive(item.path) && !isCollapsed && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 rounded-lg transition-all duration-200 -z-10"></div>
            )}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-700/30 p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          title={isCollapsed ? 'Logout' : ''}
        >
          <span className="text-xl flex-shrink-0">🚪</span>
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
