import api from '@/lib/api';

export async function getTransfers() {
  const response = await api.get('/partner-transfer');
  return response.data;
}

export async function createTransfer(payload: Record<string, unknown>) {
  const response = await api.post('/partner-transfer', payload);
  return response.data;
}

export async function updateTransfer(
  id: number,
  payload: Record<string, unknown>
) {
  const response = await api.put(`/partner-transfer/${id}`, payload);
  return response.data;
}

export async function destroyTransfer(id: number) {
  const response = await api.delete(`/partner-transfer/${id}`);
  return response.data;
}
