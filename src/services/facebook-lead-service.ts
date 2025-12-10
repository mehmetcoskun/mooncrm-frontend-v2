import api from '@/lib/api';

export async function getFacebookLeads(params?: {
  limit?: number;
  after?: string;
  before?: string;
}) {
  const response = await api.get('/facebook/leads', { params });
  return response.data;
}

export async function sendLeadToCrm(payload: {
  form_id: string;
  field_data: Record<string, string>;
  ad_name?: string | null;
  adset_name?: string | null;
  campaign_name?: string | null;
}) {
  const response = await api.post('/facebook/send-to-crm', payload);
  return response.data;
}
