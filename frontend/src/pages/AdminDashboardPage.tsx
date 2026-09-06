import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  submissionSchema,
  createAdminSchema,
  type SubmissionFormData,
  type CreateAdminFormData,
} from '../lib/validations';
import { submissionsApi, authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Gender, Submission, SubmissionStatus } from '../types';
import {
  Shield,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  UserPlus,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Phone,
  MapPin,
  MessageSquare,
  Loader2,
  Inbox,
  AlertCircle,
  User,
  Clock,
  UserCheck,
  History,
  Mail,
  Calendar,
} from 'lucide-react';
import axios from 'axios';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Submissions State
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tableError, setTableError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<Gender | 'ALL'>('ALL');

  // Edit Modal State
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Detail View Modal State (strictly bounded within 80vh)
  const [viewingSubmission, setViewingSubmission] = useState<Submission | null>(null);

  // Delete Modal State
  const [deletingSubmission, setDeletingSubmission] = useState<Submission | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Admin Creation Modal State
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState<boolean>(false);
  const [createdAdminResult, setCreatedAdminResult] = useState<{
    email: string;
    temporaryPassword?: string;
  } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState<boolean>(false);
  const [adminCreateError, setAdminCreateError] = useState<string | null>(null);

  // General Notification Banner
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Fetch Submissions
  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setTableError(null);
    try {
      const data = await submissionsApi.getSubmissions({
        search: searchTerm.trim() || undefined,
        gender: selectedGender,
      });
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.submissions)
        ? data.submissions
        : [];

      setSubmissions(list);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setTableError(err.response.data.message);
      } else {
        setTableError('Failed to load submissions from the server.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedGender]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Edit Form Hook
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors, isSubmitting: isSubmittingEdit },
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
  });

  // Open Edit Modal
  const handleOpenEdit = (submission: Submission) => {
    setEditingSubmission(submission);
    setEditError(null);
    resetEdit({
      firstName: submission.firstName,
      lastName: submission.lastName,
      email: submission.email,
      gender: submission.gender,
      mobileNumber: submission.mobileNumber,
      address: submission.address,
      feedback: submission.feedback || '',
      status: submission.status || 'PENDING',
    });
  };

  // Save Edit Submission
  const onSaveEdit = async (data: SubmissionFormData) => {
    if (!editingSubmission) return;
    setEditError(null);
    try {
      const updated = await submissionsApi.updateSubmission(editingSubmission.id, data);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)),
      );
      if (viewingSubmission && viewingSubmission.id === updated.id) {
        setViewingSubmission(updated);
      }
      setEditingSubmission(null);
      showNotification('success', `Submission for ${updated.firstName} ${updated.lastName} updated successfully.`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setEditError(err.response.data.message);
      } else {
        setEditError('Failed to save changes. Please try again.');
      }
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: SubmissionStatus = 'PENDING') => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Approved
          </span>
        );
      case 'REVIEWED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <RefreshCw className="w-3 h-3 text-blue-600" />
            Reviewed
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            ARCHIVED
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        );
    }
  };

  // Delete Submission
  const onConfirmDelete = async () => {
    if (!deletingSubmission) return;
    setIsDeleting(true);
    try {
      await submissionsApi.deleteSubmission(deletingSubmission.id);
      setSubmissions((prev) => prev.filter((s) => s.id !== deletingSubmission.id));
      showNotification(
        'success',
        `Submission record for ${deletingSubmission.firstName} ${deletingSubmission.lastName} was deleted.`,
      );
      setDeletingSubmission(null);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        showNotification('error', err.response.data.message);
      } else {
        showNotification('error', 'Failed to delete submission.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Create Admin Form Hook
  const {
    register: registerAdmin,
    handleSubmit: handleSubmitAdmin,
    reset: resetAdmin,
    formState: { errors: adminErrors, isSubmitting: isSubmittingAdmin },
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
  });

  const onAdminCreateSubmit = async (data: CreateAdminFormData) => {
    setAdminCreateError(null);
    try {
      const response = await authApi.createAdmin({ email: data.email });
      setCreatedAdminResult({
        email: data.email,
        temporaryPassword: response.temporaryPassword,
      });
      resetAdmin();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setAdminCreateError(err.response.data.message);
      } else {
        setAdminCreateError('Failed to provision administrator.');
      }
    }
  };

  const handleCopyPassword = () => {
    if (createdAdminResult?.temporaryPassword) {
      navigator.clipboard.writeText(createdAdminResult.temporaryPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  // Gender Badge Helper
  const getGenderBadge = (gender: Gender) => {
    switch (gender) {
      case 'MALE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            MALE
          </span>
        );
      case 'FEMALE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200">
            FEMALE
          </span>
        );
      case 'OTHER':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            OTHER
          </span>
        );
    }
  };

  // Counts
  const totalCount = submissions.length;
  const maleCount = submissions.filter((s) => s.gender === 'MALE').length;
  const femaleCount = submissions.filter((s) => s.gender === 'FEMALE').length;
  const otherCount = submissions.filter((s) => s.gender === 'OTHER').length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Administrative Dashboard
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Active Administrator: <span className="font-semibold text-slate-800">{user?.email}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => fetchSubmissions()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
              Refresh Data
            </button>

            {user?.isSuperAdmin && (
              <button
                onClick={() => {
                  setIsCreateAdminOpen(true);
                  setCreatedAdminResult(null);
                  setAdminCreateError(null);
                }}
                id="btn-open-create-admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                Create Admin
              </button>
            )}
          </div>
        </div>

        {/* Global Notification Banner */}
        {notification && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm font-medium ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-500 hover:text-slate-700 text-xs font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stat Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase text-slate-500">Total Shown</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase text-blue-600">Male</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{maleCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase text-pink-600">Female</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{femaleCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase text-purple-600">Other</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{otherCount}</p>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search by name / query */}
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="input-search-submissions"
              placeholder="Search by name, email, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <label htmlFor="filter-gender" className="text-xs font-semibold text-slate-600 uppercase">
                Gender:
              </label>
            </div>
            <select
              id="filter-gender"
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value as Gender | 'ALL')}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {tableError && (
            <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{tableError}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-slate-700 mx-auto" />
              <p className="text-sm font-medium text-slate-500">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-4">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-semibold text-slate-800">No Submissions Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No submissions match the active search or gender filters. Try adjusting your search query or reset filters.
              </p>
              {(searchTerm || selectedGender !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedGender('ALL');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-3.5 px-4">Full Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Gender</th>
                    <th className="py-3.5 px-4">Mobile</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Feedback</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setViewingSubmission(item)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      title="Click record to view all details"
                    >
                      {/* Full Name */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {item.firstName} {item.lastName}
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <a
                          href={`mailto:${item.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-indigo-600 hover:underline"
                        >
                          {item.email}
                        </a>
                      </td>

                      {/* Gender Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getGenderBadge(item.gender)}
                      </td>

                      {/* Mobile */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {item.mobileNumber}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Feedback */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={item.feedback}>
                        {item.feedback ? (
                          <span className="inline-flex items-center gap-1 text-slate-700">
                            <MessageSquare className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{item.feedback}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">No feedback</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingSubmission(item);
                            }}
                            id={`btn-view-submission-${item.id}`}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(item);
                            }}
                            id={`btn-edit-submission-${item.id}`}
                            className="p-1.5 rounded-md text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Edit Submission"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingSubmission(item);
                            }}
                            id={`btn-delete-submission-${item.id}`}
                            className="p-1.5 rounded-md text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Submission"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* SUBMISSION FULL DETAILS MODAL (MAX 80% VH) */}
        {/* ---------------------------------------------------- */}
        {viewingSubmission && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setViewingSubmission(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              id="submission-detail-modal"
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0 bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                    <User className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {viewingSubmission.firstName} {viewingSubmission.lastName}
                      </h3>
                      {getStatusBadge(viewingSubmission.status)}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Reference ID: <span className="font-mono font-semibold text-slate-700">{viewingSubmission.id}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingSubmission(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Close window"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content (Bounded strictly within 80vh max-height, cohesive typography, no nested card boxes) */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* Section 1: Overview & Contact Grid */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Applicant Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <span className="text-xs font-medium text-slate-500">Email Address</span>
                      <div className="flex items-center gap-1.5 mt-0.5 text-sm font-medium text-slate-900">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a
                          href={`mailto:${viewingSubmission.email}`}
                          className="text-indigo-600 hover:underline hover:text-indigo-800"
                        >
                          {viewingSubmission.email}
                        </a>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-slate-500">Mobile Phone</span>
                      <div className="flex items-center gap-1.5 mt-0.5 text-sm font-medium text-slate-900">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a
                          href={`tel:${viewingSubmission.mobileNumber}`}
                          className="hover:text-indigo-600"
                        >
                          {viewingSubmission.mobileNumber}
                        </a>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-slate-500">Gender</span>
                      <div className="mt-1">
                        {getGenderBadge(viewingSubmission.gender)}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-slate-500">Submission Status</span>
                      <div className="mt-1 flex items-center gap-2">
                        {getStatusBadge(viewingSubmission.status)}
                        <span className="text-[11px] text-slate-400 italic">
                          (Click Edit to change status)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Residential / Postal Address */}
                <div className="border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Residential Address
                  </div>
                  <div className="border-l-2 border-indigo-400 pl-3.5 py-0.5 text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                    {viewingSubmission.address}
                  </div>
                </div>

                {/* Section 3: Feedback / Notes */}
                <div className="border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    Feedback & Applicant Notes
                  </div>
                  {viewingSubmission.feedback ? (
                    <div className="border-l-2 border-slate-300 pl-3.5 py-0.5 text-sm text-slate-800 leading-relaxed">
                      {viewingSubmission.feedback}
                    </div>
                  ) : (
                    <div className="border-l-2 border-slate-200 pl-3.5 py-0.5 text-xs text-slate-400 italic">
                      No feedback or comments provided with this submission.
                    </div>
                  )}
                </div>

                {/* Section 4: Audit & Modification Tracking */}
                <div className="border-t border-slate-100 pt-5">
                  {viewingSubmission.userModified || viewingSubmission.dateModified || viewingSubmission.updatedAt ? (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2.5">
                        <History className="w-3.5 h-3.5 text-indigo-600" />
                        Modification & Audit Record
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 font-medium block text-[11px] uppercase tracking-wide">
                            userModified
                          </span>
                          <span className="font-semibold text-slate-900 inline-flex items-center gap-1.5 mt-1">
                            <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            {viewingSubmission.userModified || 'Administrator'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium block text-[11px] uppercase tracking-wide">
                            dateModified
                          </span>
                          <span className="font-semibold text-slate-900 inline-flex items-center gap-1.5 mt-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            {new Date(viewingSubmission.dateModified || viewingSubmission.updatedAt || '').toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Original Submission Created: {new Date(viewingSubmission.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2 py-1">
                      <div className="flex items-center gap-1.5 italic text-slate-500">
                        <History className="w-3.5 h-3.5 text-slate-400" />
                        This submission is in its original state and has not been modified.
                      </div>
                      <div className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Created: {new Date(viewingSubmission.createdAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/70">
                <button
                  type="button"
                  onClick={() => {
                    const sub = viewingSubmission;
                    setViewingSubmission(null);
                    setDeletingSubmission(sub);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Record
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const sub = viewingSubmission;
                      setViewingSubmission(null);
                      handleOpenEdit(sub);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Details & Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingSubmission(null)}
                    className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* EDIT SUBMISSION MODAL */}
        {/* ---------------------------------------------------- */}
        {editingSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Edit className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Edit Submission Record
                  </h3>
                </div>
                <button
                  onClick={() => setEditingSubmission(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitEdit(onSaveEdit)} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
                      {...registerEdit('firstName')}
                    />
                    {editErrors.firstName && (
                      <p className="text-xs text-rose-600 mt-0.5">{editErrors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
                      {...registerEdit('lastName')}
                    />
                    {editErrors.lastName && (
                      <p className="text-xs text-rose-600 mt-0.5">{editErrors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
                      {...registerEdit('email')}
                    />
                    {editErrors.email && (
                      <p className="text-xs text-rose-600 mt-0.5">{editErrors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white"
                      {...registerEdit('gender')}
                    >
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                    {editErrors.gender && (
                      <p className="text-xs text-rose-600 mt-0.5">{editErrors.gender.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      placeholder="0XXXXXXXXX or +XXXXXXXXXXX"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
                      {...registerEdit('mobileNumber')}
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Format: 0XXXXXXXXX or +XXXXXXXXXXX</span>
                    {editErrors.mobileNumber && (
                      <p className="text-xs text-rose-600 mt-0.5">{editErrors.mobileNumber.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white"
                      {...registerEdit('status')}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="REVIEWED">REVIEWED</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Address
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
                    {...registerEdit('address')}
                  />
                  {editErrors.address && (
                    <p className="text-xs text-rose-600 mt-0.5">{editErrors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Feedback / Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
                    {...registerEdit('feedback')}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingSubmission(null)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEdit}
                    id="btn-save-submission-edit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-60 transition-colors"
                  >
                    {isSubmittingEdit ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* DELETE CONFIRMATION MODAL */}
        {/* ---------------------------------------------------- */}
        {deletingSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Confirm Deletion
                  </h3>
                  <p className="text-xs text-slate-500">
                    This operation permanently deletes the record.
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600">
                Are you sure you want to delete the submission for{' '}
                <strong className="text-slate-900">
                  {deletingSubmission.firstName} {deletingSubmission.lastName}
                </strong>{' '}
                (<span className="text-slate-500">{deletingSubmission.email}</span>)?
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeletingSubmission(null)}
                  disabled={isDeleting}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirmDelete}
                  disabled={isDeleting}
                  id="btn-confirm-delete-submission"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* ADMIN CREATION MODAL */}
        {/* ---------------------------------------------------- */}
        {isCreateAdminOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Provision Administrator
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreateAdminOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!createdAdminResult ? (
                <form onSubmit={handleSubmitAdmin(onAdminCreateSubmit)} className="space-y-4" noValidate>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Provide the email address for the new administrator. A secure temporary password will be generated automatically.
                  </p>

                  {adminCreateError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{adminCreateError}</span>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="input-admin-email"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                    >
                      Admin Email Address
                    </label>
                    <input
                      id="input-admin-email"
                      type="email"
                      placeholder="colleague@domain.com"
                      className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-colors ${
                        adminErrors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                      }`}
                      {...registerAdmin('email')}
                    />
                    {adminErrors.email && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">
                        {adminErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateAdminOpen(false)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      id="btn-submit-create-admin"
                      disabled={isSubmittingAdmin}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs disabled:opacity-60 transition-colors cursor-pointer"
                    >
                      {isSubmittingAdmin ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                          Creating Admin...
                        </>
                      ) : (
                        'Generate & Assign'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 pt-1">
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-emerald-950">
                        Admin Account Created!
                      </h4>
                      <p className="text-xs text-emerald-800">
                        An administrator role has been granted to <strong className="font-semibold">{createdAdminResult.email}</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                      Generated Temporary Password:
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-sm font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 w-full truncate">
                        {createdAdminResult.temporaryPassword}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 cursor-pointer"
                      >
                        {copiedPassword ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateAdminOpen(false);
                        setCreatedAdminResult(null);
                      }}
                      className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
