import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type {
  AuthResponse,
  CreateAdminResponse,
  GetSubmissionsParams,
  Submission,
  SubmissionInput,
} from '../types';

// Centralized in-memory token state
let accessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

// Callbacks to sync with React context
let onTokenUpdateCallback: ((token: string | null) => void) | null = null;
let onLogoutCallback: (() => void) | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (onTokenUpdateCallback) {
    onTokenUpdateCallback(token);
  }
};

export const getAccessToken = () => accessToken;

export const configureAuthCallbacks = (
  onTokenUpdate: (token: string | null) => void,
  onLogout: () => void,
) => {
  onTokenUpdateCallback = onTokenUpdate;
  onLogoutCallback = onLogout;
};

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Base Axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Authorization header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Automatically handle 401 Unauthorized with token refresh & request retry
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If there is no response, or not a 401 error, or already retried
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Do not attempt to refresh if the failed request was the refresh endpoint itself or login/register
    const requestUrl = originalRequest.url || '';
    if (
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register')
    ) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string | null>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call refresh endpoint with HTTP-only cookie
      const refreshResponse = await axios.post<AuthResponse>(
        `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const newAccessToken = refreshResponse.data.accessToken;
      setAccessToken(newAccessToken);

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      setAccessToken(null);
      if (onLogoutCallback) {
        onLogoutCallback();
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// Organized, strongly typed service modules
export const authApi = {
  register: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  loginCustomer: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login/customer', data);
    return response.data;
  },

  loginAdmin: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login/admin', data);
    return response.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh');
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/logout');
    return response.data;
  },

  createAdmin: async (data: { email: string }): Promise<CreateAdminResponse> => {
    const response = await api.post<CreateAdminResponse>('/auth/admin', data);
    return response.data;
  },
};

export const submissionsApi = {
  createSubmission: async (data: SubmissionInput): Promise<Submission> => {
    const response = await api.post<Submission>('/submissions', data);
    return response.data;
  },

  getSubmissions: async (params?: GetSubmissionsParams): Promise<Submission[]> => {
    const queryParams: Record<string, string> = {};
    if (params?.search) {
      queryParams.search = params.search;
    }
    if (params?.gender && params.gender !== 'ALL') {
      queryParams.gender = params.gender;
    }

    const response = await api.get<Submission[]>('/submissions', {
      params: queryParams,
    });
    return response.data;
  },

  updateSubmission: async (
    id: string,
    data: Partial<SubmissionInput>,
  ): Promise<Submission> => {
    const response = await api.put<Submission>(`/submissions/${id}`, data);
    return response.data;
  },

  deleteSubmission: async (id: string): Promise<{ success: boolean; id: string }> => {
    const response = await api.delete<{ success: boolean; id: string }>(`/submissions/${id}`);
    return response.data;
  },
};

export default api;
