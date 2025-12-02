import api from '@/lib/api';

export async function getCategories() {
  const response = await api.get('/category');
  return response.data;
}

export async function createCategory(payload: Record<string, unknown>) {
  const response = await api.post('/category', payload);
  return response.data;
}

export async function updateCategory(
  id: number,
  payload: Record<string, unknown>
) {
  const response = await api.put(`/category/${id}`, payload);
  return response.data;
}

export async function destroyCategory(id: number) {
  const response = await api.delete(`/category/${id}`);
  return response.data;
}
