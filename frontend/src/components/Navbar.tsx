import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Shield,
  LogIn,
  LogOut,
  User,
  CheckCircle2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    navigate('/', { replace: true });
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand - takes to home only when NOT authenticated */}
          {!isAuthenticated ? (
            <Link
              to="/"
              className="flex items-center gap-2.5 text-slate-900 font-semibold tracking-tight text-lg hover:opacity-90 transition-opacity"
              id="brand-logo-link"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <span>Clientel</span>
            </Link>
          ) : (
            <div
              className="flex items-center gap-2.5 text-slate-900 font-semibold tracking-tight text-lg cursor-default select-none"
              id="brand-logo-static"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <span>Clientel</span>
            </div>
          )}

          {/* Navigation Actions */}
          <nav className="flex items-center gap-2 sm:gap-3">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  id="nav-customer-login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>

                <Link
                  to="/admin/login"
                  id="nav-admin-login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Portal</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Role and Email */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-none">{user?.email}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                    </span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleLogout}
                  id="btn-logout"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-slate-200"
                  title="Sign out of current account"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
