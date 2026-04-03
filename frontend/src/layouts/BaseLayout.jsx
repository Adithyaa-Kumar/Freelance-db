import { useState } from 'react';
import { Sidebar } from '@components/Sidebar.jsx';
import { Navbar } from '@components/Navbar.jsx';
import { NewWorkModal } from '@components/NewWorkModal.jsx';

export const BaseLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isNewWorkOpen, setIsNewWorkOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Sidebar />
      <Navbar sidebarCollapsed={sidebarCollapsed} />

      <main className={`transition-all duration-300 pt-20 ${sidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
        <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsNewWorkOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-4 shadow-2xl transition transform hover:scale-110 active:scale-95 flex items-center justify-center"
      >
        <span className="text-2xl">➕</span>
      </button>

      {/* New Work Modal */}
      <NewWorkModal
        isOpen={isNewWorkOpen}
        onClose={() => setIsNewWorkOpen(false)}
        onSuccess={() => setIsNewWorkOpen(false)}
      />

      <div className="fixed inset-0 opacity-30 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>
    </div>
  );
};
