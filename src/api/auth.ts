import { apiClient } from '../lib/apiClient';
import type { LoginPayload, LoginResponse } from '../types';
import { initialsOf, roleToFront, type BackendRole } from './_mappers';

interface BackendLoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: BackendRole;
    isApproved: boolean;
  };
}

/**
 * POST /auth/login. The backend authenticates by email + password only (the
 * role selector in the UI is a hint); the effective role comes from the
 * returned user record.
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<BackendLoginResponse>('/auth/login', {
    email: payload.email,
    password: payload.password,
  });

  return {
    token: data.accessToken,
    user: {
      id: data.user.id,
      fullName: data.user.fullName,
      email: data.user.email,
      role: roleToFront(data.user.role),
      avatarInitials: initialsOf(data.user.fullName),
    },
  };
}
