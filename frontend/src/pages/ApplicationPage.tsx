import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { submissionSchema, type SubmissionFormData } from '../lib/validations';
import { submissionsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Submission } from '../types';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  User,
  Phone,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import axios from 'axios';

export const ApplicationPage: React.FC = () => {
  const { user } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<{
    show: boolean;
    submission: Submission | null;
  }>({
    show: false,
    submission: null,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: user?.email || '',
      gender: 'MALE',
      mobileNumber: '',
      address: '',
      feedback: '',
    },
  });

  const onSubmit = async (data: SubmissionFormData) => {
    setServerError(null);
    try {
      // Submits to POST /api/submissions
      const created = await submissionsApi.createSubmission({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        gender: data.gender,
        mobileNumber: data.mobileNumber,
        address: data.address,
        feedback: data.feedback || undefined,
      });

      // Clear form state on success
      reset({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        gender: 'MALE',
        mobileNumber: '',
        address: '',
        feedback: '',
      });

      // Display toast notification
      setSuccessToast({
        show: true,
        submission: created,
      });

      // Auto-hide toast after 6 seconds
      setTimeout(() => {
        setSuccessToast((prev) => ({ ...prev, show: false }));
      }, 6000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('Failed to submit application. Please verify details and try again.');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page Title & Status Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Customer Application Portal
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Submit Your Verification Application
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Logged in as: <span className="font-semibold text-slate-800">{user?.email}</span>
            </p>
          </div>
        </div>

        {/* Success Toast Notification */}
        {successToast.show && (
          <div
            id="submission-success-toast"
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-start justify-between gap-3 animate-fade-in"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-emerald-900">
                  Application Submitted Successfully!
                </h4>
                <p className="text-xs text-emerald-700">
                  Reference ID:{' '}
                  <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                    {successToast.submission?.id}
                  </code>
                  . Your application has been logged into the review queue.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSuccessToast({ show: false, submission: null })}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Server Error */}
        {serverError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Submission Failed</p>
              <p className="text-xs text-rose-600 mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {/* Application Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Section 1: Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                Personal Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="input-firstName"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-firstName"
                    type="text"
                    placeholder="e.g. Jordan"
                    className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors ${
                      errors.firstName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="input-lastName"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-lastName"
                    type="text"
                    placeholder="e.g. Taylor"
                    className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors ${
                      errors.lastName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="input-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-email"
                    type="email"
                    placeholder="name@domain.com"
                    className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors ${
                      errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Gender Dropdown */}
                <div>
                  <label
                    htmlFor="select-gender"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="select-gender"
                    className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors ${
                      errors.gender ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                    {...register('gender')}
                  >
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Contact Details */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-600" />
                Contact & Address
              </h3>

              {/* Mobile Number */}
              <div>
                <label
                  htmlFor="input-mobileNumber"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-mobileNumber"
                  type="tel"
                  placeholder="0712345678 or +94712345678"
                  className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors ${
                    errors.mobileNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                  {...register('mobileNumber')}
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Accepted format: 10 digits starting with 0 (e.g. 0712345678) or + followed by 11 digits (e.g. +94712345678)
                </span>
                {errors.mobileNumber && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {errors.mobileNumber.message}
                  </p>
                )}
              </div>

              {/* Physical Address */}
              <div>
                <label
                  htmlFor="input-address"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Residential / Street Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-2.5 left-3 pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <textarea
                    id="input-address"
                    rows={2}
                    placeholder="123 Street Name, City, State/Province, Postal Code"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors ${
                      errors.address ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                    {...register('address')}
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>

            {/* Section 3: Additional Feedback */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Additional Comments & Feedback
              </h3>

              <div>
                <label
                  htmlFor="input-feedback"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Feedback or Special Instructions (Optional)
                </label>
                <textarea
                  id="input-feedback"
                  rows={3}
                  placeholder="Share any special notes, schedule preferences, or background details..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
                  {...register('feedback')}
                />
                {errors.feedback && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {errors.feedback.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Clear Fields
              </button>
              <button
                type="submit"
                id="btn-submit-application"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs disabled:opacity-60 transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPage;
