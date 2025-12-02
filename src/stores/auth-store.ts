import {
  getCurrentUser,
  login as loginService,
  logout as logoutService,
  verifyTwoFactor as verifyTwoFactorService,
  changePassword as changePasswordService,
} from '@/services/auth-service';
import type {
  AuthState,
  LoginPayload,
  TwoFactorVerifyPayload,
  ChangePasswordPayload,
} from '@/types/auth';
import { create } from 'zustand';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  login: async (payload: LoginPayload) => {
    try {
      set({ isLoading: true, error: null });
      const response = await loginService(payload);

      if (response.requires_two_factor) {
        set({ isLoading: false });
        return response;
      }

      if (response.token) {
        const userData = await getCurrentUser();
        set({ user: userData, isAuthenticated: true, isLoading: false });
        return response;
      }

      set({ isLoading: false });
      return response;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Giriş başarısız oldu',
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  verifyTwoFactor: async (payload: TwoFactorVerifyPayload) => {
    try {
      set({ isLoading: true, error: null });
      const response = await verifyTwoFactorService(
        payload.userId,
        payload.code
      );
      const userData = await getCurrentUser();
      set({ user: userData, isAuthenticated: true, isLoading: false });
      return response;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Doğrulama başarısız oldu',
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  changePassword: async (payload: ChangePasswordPayload) => {
    try {
      set({ isLoading: true, error: null });
      await changePasswordService(
        payload.currentPassword,
        payload.newPassword,
        payload.newPasswordConfirmation
      );
      set({ isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Şifre değiştirme başarısız oldu',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    logoutService();
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const userData = await getCurrentUser();
      set({ user: userData, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Kullanıcı bilgileri alınamadı',
        isLoading: false,
        user: null,
        isAuthenticated: false,
      });
    }
  },
}));
