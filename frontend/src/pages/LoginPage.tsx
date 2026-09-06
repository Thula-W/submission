import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../lib/validations';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Loader2, User, X } from 'lucide-react';
import axios from 'axios';

export const LoginPage: React.FC = () => {
  const { loginCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  // Pre-fill email if redirected from registration
  const registeredEmail = (location.state as { registeredEmail?: string })?.registeredEmail || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: registeredEmail || '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      // Submits to POST /api/auth/login/customer
      // Saves accessToken and user info into Auth Context; redirects to /apply
      await loginCustomer({
        email: data.email,
        password: data.password,
      });

      const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname;
      navigate(fromPath || '/apply', { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('Invalid email or password. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-md w-full relative bg-white py-8 px-6 sm:px-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Close Button navigating to home */}
        <Link
          to="/"
          id="btn-close-customer-login"
          aria-label="Close and return to home"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </Link>

        {/* Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center mx-auto text-indigo-600 shadow-xs">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Customer Login
          </h2>
          <p className="text-sm text-slate-600">
            Access your application portal.
          </p>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors ${
                    errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your account password"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors ${
                    errors.password ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-customer-login-submit"
              disabled={isSubmitting}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs disabled:opacity-60 transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <span>Sign In as Customer</span>
                  <User className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Alternative links */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            <p>
              Don't have an account?{' '}
              <Link
                to="/register"
                id="link-to-register"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
    </div>
  );
};

export default LoginPage;
