import api from '@/lib/api';

export async function getPermissions() {
  const response = await api.get('/permission');
  return response.data;
}

export async function createPermission(payload: Record<string, unknown>) {
  const response = await api.post('/permission', payload);
  return response.data;
}

export async function updatePermission(
  id: number,
  payload: Record<string, unknown>
) {
  const response = await api.put(`/permission/${id}`, payload);
  return response.data;
}

export async function destroyPermission(id: number) {
  const response = await api.delete(`/permission/${id}`);
  return response.data;
}

export async function getAvailablePermissions() {
  const response = await api.get('/permission/available-permissions');
  return response.data;
}
