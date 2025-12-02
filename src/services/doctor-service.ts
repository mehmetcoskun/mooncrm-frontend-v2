import api from '@/lib/api';

export async function getDoctors() {
  const response = await api.get('/doctor');
  return response.data;
}

export async function createDoctor(payload: Record<string, unknown>) {
  const response = await api.post('/doctor', payload);
  return response.data;
}

export async function updateDoctor(
  id: number,
  payload: Record<string, unknown>
) {
  const response = await api.put(`/doctor/${id}`, payload);
  return response.data;
}

export async function destroyDoctor(id: number) {
  const response = await api.delete(`/doctor/${id}`);
  return response.data;
}
