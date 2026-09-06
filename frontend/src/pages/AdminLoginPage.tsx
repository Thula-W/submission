import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../lib/validations';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, Loader2, X } from 'lucide-react';
import axios from 'axios';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      // Submits to POST /api/auth/login/admin
      // Saves accessToken and user info into Auth Context; redirects to /admin/dashboard
      await loginAdmin({
        email: data.email,
        password: data.password,
      });

      const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname;
      navigate(fromPath || '/admin/dashboard', { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('Invalid administrator credentials. Access is restricted.');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-slate-100">
      <div className="max-w-md w-full relative bg-slate-800/90 py-8 px-6 sm:px-8 rounded-2xl border border-slate-700 shadow-xl space-y-6 backdrop-blur">
        {/* Close Button navigating to home */}
        <Link
          to="/"
          id="btn-close-admin-login"
          aria-label="Close and return to home"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </Link>

        {/* Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center mx-auto text-amber-400 shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Admin Access Portal
          </h2>
          <p className="text-sm text-slate-400">
            Authorized administrative staff and submission reviewers only
          </p>
        </div>

        {/* Error Message */}
        {serverError && (
          <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800 flex items-start gap-2.5 text-rose-300 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
            <span>{serverError}</span>
          </div>
        )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1"
              >
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@portal.com"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm text-white placeholder:text-slate-500 bg-slate-900/80 focus:outline-hidden focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-colors ${
                    errors.email ? 'border-rose-500' : 'border-slate-700'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-400 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1"
              >
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter administrator password"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm text-white placeholder:text-slate-500 bg-slate-900/80 focus:outline-hidden focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-colors ${
                    errors.password ? 'border-rose-500' : 'border-slate-700'
                  }`}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-400 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-admin-login-submit"
              disabled={isSubmitting}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-md disabled:opacity-60 transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  Authenticating...
                </>
              ) : (
                <>
                  <span>Verify & Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom link to switch to customer */}
          <div className="pt-4 border-t border-slate-700/80 text-center">
            <p className="text-xs text-slate-400">
              Are you a customer?{' '}
              <Link
                to="/login"
                id="link-switch-to-customer"
                className="font-semibold text-amber-400 hover:underline"
              >
                Go to Customer Login
              </Link>
            </p>
          </div>
        </div>
    </div>
  );
};

export default AdminLoginPage;
