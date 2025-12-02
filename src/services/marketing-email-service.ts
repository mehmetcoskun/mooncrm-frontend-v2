import api from '@/lib/api';

export async function sendEmail(payload: Record<string, unknown>) {
  const response = await api.post('/marketing/email/send', payload);
  return response.data;
}