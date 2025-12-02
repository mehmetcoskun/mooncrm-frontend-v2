import api from '@/lib/api';

export async function getTwoFactorStatus() {
  const response = await api.get('/auth/two-factor/status');
  return response.data;
}

export async function generateQrCode() {
  const response = await api.post('/auth/two-factor/qr-code');
  return response.data;
}

export async function enableTwoFactor(code: string) {
  const response = await api.post('/auth/two-factor/enable', { code });
  return response.data;
}

export async function disableTwoFactor(password: string) {
  const response = await api.post('/auth/two-factor/disable', { password });
  return response.data;
}

export async function regenerateRecoveryCodes(password: string) {
  const response = await api.post('/auth/two-factor/recovery-codes', {
    password,
  });
  return response.data;
}
