import type { User } from '@/features/users/data/schema';

export interface LoginPayload {
  organization_code: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  requires_two_factor?: boolean;
  user_id?: number;
  user?: User;
  token?: string;
  organization_id?: number;
  needs_password_change?: boolean;
}

export interface TwoFactorVerifyPayload {
  userId: number;
  code: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  verifyTwoFactor: (payload: TwoFactorVerifyPayload) => Promise<LoginResponse>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}
