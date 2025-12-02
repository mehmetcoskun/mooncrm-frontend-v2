import api from '@/lib/api';

export async function getRoles() {
  const response = await api.get('/role');
  return response.data;
}

export async function createRole(payload: Record<string, unknown>) {
  const response = await api.post('/role', payload);
  return response.data;
}

export async function updateRole(id: number, payload: Record<string, unknown>) {
  const response = await api.put(`/role/${id}`, payload);
  return response.data;
}

export async function destroyRole(id: number) {
  const response = await api.delete(`/role/${id}`);
  return response.data;
}
