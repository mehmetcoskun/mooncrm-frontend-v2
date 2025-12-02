import api from '@/lib/api';

export async function getOrganizations() {
  const response = await api.get('/organization');
  return response.data;
}

export async function createOrganization(payload: FormData) {
  const response = await api.post('/organization', payload, {
    headers:
      payload instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : {},
  });
  return response.data;
}

export async function getOrganization(id: number) {
  const response = await api.get(`/organization/${id}`);
  return response.data;
}

export async function updateOrganization(id: number, payload: FormData) {
  if (payload instanceof FormData) {
    payload.append('_method', 'PUT');
    const response = await api.post(`/organization/${id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
}

export async function destroyOrganization(id: number) {
  const response = await api.delete(`/organization/${id}`);
  return response.data;
}
