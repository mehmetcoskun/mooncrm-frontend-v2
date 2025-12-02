import api from '@/lib/api';

export async function getReports(filters: Record<string, unknown>) {
  const response = await api.get('/report', { params: filters });
  return response.data;
}
