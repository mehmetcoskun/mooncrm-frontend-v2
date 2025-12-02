import api from '@/lib/api';

export async function sendSms(payload: Record<string, unknown>) {
  const response = await api.post('/marketing/sms/send', payload);
  return response.data;
}

export async function bulkSendSms(payload: Record<string, unknown>) {
  const response = await api.post('/marketing/sms/bulk-send', payload);
  return response.data;
}
