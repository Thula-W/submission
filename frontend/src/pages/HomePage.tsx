import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Shield,
  UserPlus,
  LogIn,
  ArrowRight,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  Search,
  History,
  Lock,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 pt-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Seamless Application Intake & <br className="hidden sm:inline" />
            <span className="text-indigo-600">Administrative Portal</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            A secure, streamlined platform for customers to submit applications and feedback, paired with a robust administrative management portal.
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap justify-center gap-3 sm:gap-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  id="hero-btn-register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs transition-all hover:shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Register as Customer
                </Link>
                
                <Link
                  to="/admin/login"
                  id="hero-btn-admin-login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-xs transition-colors"
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  Admin Portal
                </Link>
              </>
            ) : user?.role === 'CUSTOMER' ? (
              <Link
                to="/apply"
                id="hero-btn-apply"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all"
              >
                <FileText className="w-4 h-4" />
                Go to Application Form
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/admin/dashboard"
                id="hero-btn-dashboard"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                Open Admin Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </section>

        {/* Workflow Overview */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Application Lifecycle
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              How submissions are processed from initial submission through administrative review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-indigo-600 tracking-wide">STEP 1</span>
                  <h3 className="text-base font-semibold text-slate-900">Submission & Validation</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Applicants complete personal details with strict schema validation on names, addresses, and standardized mobile contact formats.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Immediate client & server verification</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-indigo-600 tracking-wide">STEP 2</span>
                  <h3 className="text-base font-semibold text-slate-900">Intake & Queueing</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Submissions are cataloged with automated timestamps and assigned an initial Pending status in the central administrative repository.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Audited submission timestamp</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-indigo-600 tracking-wide">STEP 3</span>
                  <h3 className="text-base font-semibold text-slate-900">Administrative Decision</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Authorized administrators review details, update status to Under Review, Approved, or Rejected, with complete modification logging.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Modifier email & date logged</span>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Core Standards */}
        <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Platform Standards & Key Capabilities
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Built with precision data integrity, responsive controls, and comprehensive administrative oversight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900">Standardized data Validation</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Enforces data validation accross forms to keep the system reliable.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <History className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900">Audit & Modification Tracking</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every record modification tracks the administrator&apos;s email address and the exact modification timestamp, preventing untracked alterations and ensuring full accountability.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <Search className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900">Real-Time Filtering & Search</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Administrators can instantly query applications by applicant name, filter by gender or status, and inspect detailed profiles in an unfragmented layout.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <Lock className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900">Role-Based Access Isolation</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Strict boundary separation between customer applicant accounts and administrative accounts, secured with authenticated sessions and token management.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Status Indicators Reference */}
        <section className="bg-slate-100/60 rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Application Status Indicators</h3>
              <p className="text-xs text-slate-500">Statuses assigned and updated by administrators during evaluation</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-xs font-semibold text-slate-800">PENDING</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">Awaiting initial administrative triage</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-xs font-semibold text-slate-800">UNDER REVIEW</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">Being actively evaluated by an admin</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-semibold text-slate-800">APPROVED</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">Verified and accepted application</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-xs font-semibold text-slate-800">REJECTED</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">Does not meet current requirements</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
