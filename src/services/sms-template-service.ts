import api from '@/lib/api';

export async function getSmsTemplates() {
  const response = await api.get('/template/sms');
  return response.data;
}

export async function createSmsTemplate(payload: Record<string, unknown>) {
  const response = await api.post('/template/sms', payload);
  return response.data;
}

export async function updateSmsTemplate(
  id: number,
  payload: Record<string, unknown>
) {
  const response = await api.put(`/template/sms/${id}`, payload);
  return response.data;
}

export async function destroySmsTemplate(id: number) {
  const response = await api.delete(`/template/sms/${id}`);
  return response.data;
}
