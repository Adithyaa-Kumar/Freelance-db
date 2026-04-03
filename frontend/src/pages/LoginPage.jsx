import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@services/api.js';
import { useAuthStore } from '@hooks/useStore.js';
import { LoadingSpinner } from '@components/Common.jsx';
import { validateLoginForm } from '@utils/validation.js';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setError(validation.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      console.log('[LoginPage] Attempting login with:', { email });
      const response = await authApi.login(email, password);
      console.log('[LoginPage] Login response received:', response);
      console.log('[LoginPage] response.data:', response.data);
      
      const { token, user } = response.data;
      console.log('[LoginPage] Extracted token and user:', { token: token ? 'present' : 'missing', user: user ? 'present' : 'missing' });

      if (!token || !user) {
        console.error('[LoginPage] Missing token or user in response');
        throw new Error('Invalid response from server');
      }

      // Set token and user - Zustand persist middleware saves automatically
      console.log('[LoginPage] Setting token and user in store...');
      setToken(token);
      setUser(user);

      // Verify state was set before navigating
      console.log('[LoginPage] Triggering redirect after 50ms...');
      setTimeout(() => {
        console.log('[LoginPage] Navigating to /dashboard');
        navigate('/dashboard', { replace: true });
      }, 50);
    } catch (err) {
      console.error('[LoginPage] Login error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Login failed. Please try again.';
      console.error('[LoginPage] Error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card">
          <div className="text-center mb-8">
            <div className="inline-block mb-4 p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full">
              <span className="text-2xl">🚀</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              FreelanceFlow
            </h1>
            <p className="text-cyan-200/80">Welcome back</p>
          </div>

          {error && (
            <div className="mb-6 glass-alert-error">
              <div className="flex items-start justify-between">
                <p className="text-red-200 text-sm flex-1">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="text-red-300 hover:text-red-100 ml-3 flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2 ml-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border border-cyan-400/30 bg-slate-800/50 checked:bg-cyan-500 cursor-pointer"
                />
                <span className="text-slate-300 group-hover:text-cyan-200 transition-colors">
                  Remember me
                </span>
              </label>
              <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="glass-button w-full group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
          </div>

          <p className="text-center text-slate-300 text-sm">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-xs text-slate-500 text-right pointer-events-none">
        <p>Demo: alice@acmecorp.com</p>
      </div>
    </div>
  );
};
