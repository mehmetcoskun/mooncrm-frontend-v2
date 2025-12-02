import api from '@/lib/api';

export async function getSegments() {
  const response = await api.get('/segment');
  return response.data;
}

export async function createSegment(payload: Record<string, unknown>) {
  const response = await api.post('/segment', payload);
  return response.data;
}

export async function getSegment(id: number) {
  const response = await api.get(`/segment/${id}`);
  return response.data;
}

export async function updateSegment(
  id: number,
  payload: Record<string, unknown>
) {
  const response = await api.put(`/segment/${id}`, payload);
  return response.data;
}

export async function destroySegment(id: number) {
  const response = await api.delete(`/segment/${id}`);
  return response.data;
}