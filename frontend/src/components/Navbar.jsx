import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@hooks/useStore.js';

export const Navbar = ({ sidebarCollapsed = false }) => {
  const { user } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New client signed up', time: '5m ago', icon: '👤' },
    { id: 2, message: 'Payment received', time: '2h ago', icon: '💰' },
    { id: 3, message: 'Project deadline tomorrow', time: '1d ago', icon: '⏰' },
  ]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <nav
      className={`fixed top-0 right-0 h-20 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-b border-slate-700/30 z-40 transition-all duration-300 flex items-center justify-between px-6 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
      style={{ boxShadow: '0 0 30px rgba(34, 211, 238, 0.1)' }}
    >
      <div className="flex-1 max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 pl-10 rounded-lg bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-700/50 transition-all"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            🔍
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-all relative group"
            title="Notifications"
          >
            <span className="text-xl">🔔</span>
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/0 to-purple-500/0 group-hover:from-cyan-400/10 group-hover:to-purple-500/10 rounded-lg transition-all"></div>
          </button>

          {isNotificationsOpen && (
            <div
              className="absolute right-0 mt-2 w-80 bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/50 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
              style={{
                boxShadow: '0 20px  40px rgba(34, 211, 238, 0.15)',
              }}
            >
              <div className="px-4 py-3 border-b border-slate-700/30 bg-slate-800/50">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <span>🔔</span> Notifications
                  {notifications.length > 0 && (
                    <span className="ml-auto text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                      {notifications.length} new
                    </span>
                  )}
                </h3>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="px-4 py-3 border-b border-slate-700/20 hover:bg-slate-700/30 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0">{notification.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 text-sm leading-snug">
                            {notification.message}
                          </p>
                          <p className="text-slate-500 text-xs mt-1">{notification.time}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-slate-400">
                    <p className="text-sm">No notifications</p>
                  </div>
                )}
              </div>

              <div className="px-4 py-2 border-t border-slate-700/30 bg-slate-800/30">
                <button className="w-full text-center text-xs text-cyan-400 hover:text-cyan-300 transition-colors py-2">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-3 p-2 hover:bg-slate-700/50 rounded-lg transition-all group"
            title="Profile"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-slate-300 hidden sm:inline-block">{user?.email?.split('@')[0]}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
