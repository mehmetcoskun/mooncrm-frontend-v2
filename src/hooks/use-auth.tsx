import { useCallback, useEffect } from 'react';
import type {
  LoginPayload,
  TwoFactorVerifyPayload,
  ChangePasswordPayload,
} from '@/types/auth';
import { useAuthStore } from '@/stores/auth-store';
import { getCookie } from '@/lib/cookies';

export function useAuth() {
  const {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    fetchUser,
    verifyTwoFactor,
    changePassword,
  } = useAuthStore();

  useEffect(() => {
    const token = getCookie('token');
    if (token && !user) {
      fetchUser();
    }
  }, [fetchUser, user]);

  const handleLogin = useCallback(
    async (data: LoginPayload) => {
      return await login(data);
    },
    [login]
  );

  const handleVerifyTwoFactor = useCallback(
    async (data: TwoFactorVerifyPayload) => {
      return await verifyTwoFactor(data);
    },
    [verifyTwoFactor]
  );

  const handleChangePassword = useCallback(
    async (data: ChangePasswordPayload) => {
      await changePassword(data);
    },
    [changePassword]
  );

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = '/sign-in';
  }, [logout]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login: handleLogin,
    verifyTwoFactor: handleVerifyTwoFactor,
    changePassword: handleChangePassword,
    logout: handleLogout,
  };
}
