import api from '@/lib/api';

export async function getWhatsappSessions() {
  const response = await api.get('/whatsapp/session');
  return response.data;
}

export async function createWhatsappSession(payload: Record<string, unknown>) {
  const response = await api.post('/whatsapp/session', payload);
  return response.data;
}

export async function destroyWhatsappSession(id: number) {
  const response = await api.delete(`/whatsapp/session/${id}`);
  return response.data;
}
