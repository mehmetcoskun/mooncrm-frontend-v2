import api from '@/lib/api';

export async function getStatistics(filters: Record<string, unknown>) {
  const response = await api.get('/statistics', { params: filters });
  return response.data;
}
