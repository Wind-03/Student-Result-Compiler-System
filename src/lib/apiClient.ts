import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

/**
 * Shared axios instance used by every module in src/api/*.
 *
 * TO SWITCH FROM MOCKS TO A REAL BACKEND:
 *   1. Delete/skip the call to `installMockAdapter(apiClient)` in src/mocks/index.ts
 *      (or just remove the import in main.tsx).
 *   2. Point `baseURL` below at your real API (e.g. via VITE_API_BASE_URL).
 *   3. Nothing in src/api/*.ts, src/hooks/*.ts, or any page/component needs to change -
 *      they all call this client, not the mock adapter, directly.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the bearer token from the auth store to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized 401 handling - log the user out if the real backend rejects the token.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
