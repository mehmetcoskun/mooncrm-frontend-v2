import api from '@/lib/api';

export async function getServices() {
  const response = await api.get('/service');
  return response.data;
}

export async function createService(payload: Record<string, unknown>) {
  const response = await api.post('/service', payload);
  return response.data;
}

export async function updateService(
  id: number,
  payload: Record<string, unknown>
) {
  const response = await api.put(`/service/${id}`, payload);
  return response.data;
}

export async function destroyService(id: number) {
  const response = await api.delete(`/service/${id}`);
  return response.data;
}
