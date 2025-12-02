import api from '@/lib/api';

export async function getStatuses() {
  const response = await api.get('/status');
  return response.data;
}

export async function createStatus(payload: Record<string, unknown>) {
  const response = await api.post('/status', payload);
  return response.data;
}

export async function updateStatus(
  id: number,
  payload: Record<string, unknown>
) {
  const response = await api.put(`/status/${id}`, payload);
  return response.data;
}

export async function destroyStatus(id: number) {
  const response = await api.delete(`/status/${id}`);
  return response.data;
}
