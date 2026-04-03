import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@services/api.js';
import { useAuthStore } from '@hooks/useStore.js';
import { LoadingSpinner } from '@components/Common.jsx';
import { validateSignupForm } from '@utils/validation.js';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validation = validateSignupForm(
      formData.email,
      formData.password,
      formData.name,
      formData.confirmPassword
    );
    if (!validation.isValid) {
      setError(validation.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.signup(
        formData.email,
        formData.password,
        formData.name
      );
      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      // Set token and user - Zustand persist middleware saves automatically
      setToken(token);
      setUser(user);

      // Verify state was set before navigating
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 50);
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Signup failed. Please try again.';
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
              <span className="text-2xl">✨</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Join FreelanceFlow
            </h1>
            <p className="text-cyan-200/80">Create your account and start today</p>
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
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="glass-input"
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="glass-input"
                placeholder="••••••••"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-400 mt-1 ml-1">
                At least 6 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2 ml-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="glass-input"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="glass-button w-full group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
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
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
