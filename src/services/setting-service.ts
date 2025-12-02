import api from '@/lib/api';

export async function getSetting() {
  const response = await api.get(`/setting`);
  return response.data;
}

export async function updateOrCreateSetting(payload: Record<string, unknown>) {
  const response = await api.post(`/setting`, payload);
  return response.data;
}

export async function verifyMail(payload: Record<string, unknown>) {
  const response = await api.post(`/setting/verify-mail`, payload);
  return response.data;
}
