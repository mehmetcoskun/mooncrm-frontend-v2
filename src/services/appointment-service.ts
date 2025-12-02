import api from '@/lib/api';

export async function getAppointments(params: { month: number; year: number }) {
  const response = await api.get('/appointment', { params });
  return response.data;
}
