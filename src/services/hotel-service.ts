import api from '@/lib/api';

export async function getHotels() {
  const response = await api.get('/partner-hotel');
  return response.data;
}

export async function createHotel(payload: Record<string, unknown>) {
  const response = await api.post('/partner-hotel', payload);
  return response.data;
}

export async function updateHotel(
  id: number,
  payload: Record<string, unknown>
) {
  const response = await api.put(`/partner-hotel/${id}`, payload);
  return response.data;
}

export async function destroyHotel(id: number) {
  const response = await api.delete(`/partner-hotel/${id}`);
  return response.data;
}
