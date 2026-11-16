import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { authStore, useAuthStore, type Session } from '@/shared/stores/authStore';
import { ApiError } from '@/shared/lib/apiError';

const baseURL = import.meta.env.VITE_API_URL;

/** The one Axios instance the whole app uses. Feature services import this — never raw axios. */
export const api: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

/** A bare client for the refresh call itself, so the response interceptor never recurses. */
const refreshClient = axios.create({ baseURL });

// Endpoints that must never trigger the 401 → refresh loop.
const AUTH_BYPASS = [
  '/auth/refresh', '/auth/otp/request', '/auth/otp/verify', '/auth/mfa/login/verify',
  '/auth/mfa/enroll', '/auth/mfa/verify',
];

function isAuthBypass(url: string | undefined): boolean {
  return !!url && AUTH_BYPASS.some((path) => url.includes(path));
}

// --- Request interceptor: attach the bearer token. ---
api.interceptors.request.use((config) => {
  const { accessToken } = authStore.getState();
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * Single in-flight refresh shared by all callers. The backend refresh token is single-use, so
 * concurrent 401s must await one refresh rather than each spending the token.
 */
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { refreshToken } = authStore.getState();
  if (!refreshToken) throw new Error('No refresh token.');

  const { data } = await refreshClient.post<Session>('/auth/refresh', { refreshToken });
  useAuthStore.getState().updateTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

function handleSessionExpired(): void {
  useAuthStore.getState().clear();
  // Avoid redirect loops if we are already on the login screen.
  if (!window.location.pathname.startsWith('/login')) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.assign(`/login?next=${next}`);
  }
}

// --- Response interceptor: normalize errors + drive the refresh flow. ---
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;
    const status = error.response?.status;

    const isRefreshable =
      status === 401 &&
      original &&
      !original._retried &&
      !isAuthBypass(original.url) &&
      authStore.getState().refreshToken !== null;

    if (isRefreshable) {
      original._retried = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const token = await refreshPromise;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original); // retry once
      } catch {
        handleSessionExpired();
        return Promise.reject(ApiError.from(error));
      }
    }

    return Promise.reject(ApiError.from(error));
  },
);
