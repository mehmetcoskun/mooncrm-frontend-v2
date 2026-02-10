import api from '@/lib/api';

export async function getUsers() {
  const response = await api.get('/user');
  return response.data;
}

export async function createUser(payload: Record<string, unknown>) {
  const response = await api.post('/user', payload);
  return response.data;
}

export async function updateUser(id: number, payload: Record<string, unknown>) {
  const response = await api.put(`/user/${id}`, payload);
  return response.data;
}

export async function updateProfile(payload: Record<string, unknown>) {
  const response = await api.put('/auth/profile', payload);
  return response.data;
}

export async function destroyUser(id: number) {
  const response = await api.delete(`/user/${id}`);
  return response.data;
}

export async function getTokens(userId: number) {
  const response = await api.get(`/user/${userId}/tokens`);
  return response.data;
}

export async function createToken(
  userId: number,
  payload: Record<string, unknown>
) {
  const response = await api.post(`/user/${userId}/tokens`, payload);
  return response.data;
}

export async function destroyToken(userId: number, tokenId: number) {
  const response = await api.delete(`/user/${userId}/tokens/${tokenId}`);
  return response.data;
}
