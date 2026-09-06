import { apiClient } from '../lib/apiClient';
import type { LoginPayload, LoginResponse } from '../types';

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
  return data;
}
