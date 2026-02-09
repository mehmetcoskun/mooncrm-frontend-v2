import api from '@/lib/api';

export async function getOrganizations() {
  const response = await api.get('/organization');
  return response.data;
}

export async function createOrganization(payload: Record<string, unknown>) {
  const response = await api.post('/organization', payload);
  return response.data;
}

export async function getOrganization(id: number) {
  const response = await api.get(`/organization/${id}`);
  return response.data;
}

export async function updateOrganization(
  id: number,
  payload: Record<string, unknown>
) {
  const response = await api.put(`/organization/${id}`, payload);
  return response.data;
}

export async function destroyOrganization(id: number) {
  const response = await api.delete(`/organization/${id}`);
  return response.data;
}
