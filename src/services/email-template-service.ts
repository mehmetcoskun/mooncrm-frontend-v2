import api from '@/lib/api';

export async function getEmailTemplates() {
  const response = await api.get('/template/email');
  return response.data;
}

export async function createEmailTemplate(payload: Record<string, unknown>) {
  const response = await api.post('/template/email', payload);
  return response.data;
}

export async function getEmailTemplate(id: number) {
  const response = await api.get(`/template/email/${id}`);
  return response.data;
}

export async function updateEmailTemplate(
  id: number,
  payload: Record<string, unknown>
) {
  const response = await api.put(`/template/email/${id}`, payload);
  return response.data;
}

export async function destroyEmailTemplate(id: number) {
  const response = await api.delete(`/template/email/${id}`);
  return response.data;
}
