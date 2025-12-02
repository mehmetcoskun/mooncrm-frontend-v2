import api from '@/lib/api';

export async function getWhatsappTemplates() {
  const response = await api.get('/whatsapp/template');
  return response.data;
}

export async function createWhatsappTemplate(payload: Record<string, unknown>) {
  const response = await api.post('/whatsapp/template', payload);
  return response.data;
}

export async function updateWhatsappTemplate(
  id: number,
  payload: Record<string, unknown>
) {
  const response = await api.put(`/whatsapp/template/${id}`, payload);
  return response.data;
}

export async function destroyWhatsappTemplate(id: number) {
  const response = await api.delete(`/whatsapp/template/${id}`);
  return response.data;
}
