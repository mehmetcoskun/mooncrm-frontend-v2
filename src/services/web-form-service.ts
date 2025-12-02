import api from '@/lib/api';

export async function getWebForms() {
  const response = await api.get('/web-form');
  return response.data;
}

export async function createWebForm(payload: Record<string, unknown>) {
  const response = await api.post('/web-form', payload);
  return response.data;
}

export async function updateWebForm(
  id: number,
  payload: Record<string, unknown>
) {
  const response = await api.put(`/web-form/${id}`, payload);
  return response.data;
}

export async function destroyWebForm(id: number) {
  const response = await api.delete(`/web-form/${id}`);
  return response.data;
}

export async function getWebFormIframeByUuid(uuid: string) {
  const response = await api.get(`/web-form/iframe/${uuid}`);
  return response.data;
}

export async function submitWebFormIframeByUuid(
  uuid: string,
  payload: Record<string, unknown>
) {
  const response = await api.post(`/web-form/iframe/${uuid}`, payload);
  return response.data;
}
