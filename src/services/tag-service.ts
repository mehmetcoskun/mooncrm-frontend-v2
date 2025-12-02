import api from '@/lib/api';

export async function getTags() {
  const response = await api.get('/tag');
  return response.data;
}

export async function createTag(payload: Record<string, unknown>) {
  const response = await api.post('/tag', payload);
  return response.data;
}

export async function updateTag(id: number, payload: Record<string, unknown>) {
  const response = await api.put(`/tag/${id}`, payload);
  return response.data;
}

export async function destroyTag(id: number) {
  const response = await api.delete(`/tag/${id}`);
  return response.data;
}
