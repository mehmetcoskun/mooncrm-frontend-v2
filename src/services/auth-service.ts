import type { LoginPayload } from '@/types/auth';
import api from '@/lib/api';
import { setCookie, getCookie, removeCookie } from '@/lib/cookies';

export async function login(payload: LoginPayload) {
  const response = await api.post('/auth/login', payload);
  const { token, organization_id } = response.data;

  if (token) {
    setCookie('token', token);

    if (organization_id) {
      localStorage.setItem('organization_id', String(organization_id));
    }
  }

  return response.data;
}

export async function verifyTwoFactor(userId: number, code: string) {
  const response = await api.post('/auth/two-factor/verify', {
    user_id: userId,
    code,
  });
  const { token, organization_id } = response.data;

  setCookie('token', token);

  if (organization_id) {
    localStorage.setItem('organization_id', String(organization_id));
  }

  return response.data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  newPasswordConfirmation: string
) {
  const response = await api.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
    new_password_confirmation: newPasswordConfirmation,
  });
  return response.data;
}

export async function logout() {
  removeCookie('token');
  localStorage.removeItem('organization_id');
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data;
}

export function isAuthenticated() {
  return !!getCookie('token');
}
