import api from '@/lib/api';

export async function getHotels() {
  const response = await api.get('/hotel');
  return response.data;
}

export async function createHotel(payload: Record<string, unknown>) {
  const response = await api.post('/hotel', payload);
  return response.data;
}

export async function updateHotel(
  id: number,
  payload: Record<string, unknown>
) {
  const response = await api.put(`/hotel/${id}`, payload);
  return response.data;
}

export async function destroyHotel(id: number) {
  const response = await api.delete(`/hotel/${id}`);
  return response.data;
}
