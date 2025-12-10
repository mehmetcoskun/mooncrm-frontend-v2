import api from '@/lib/api';

export async function getFacebookPages() {
  const response = await api.get('/facebook/pages');
  return response.data;
}

export async function getFacebookForms(pageId: string) {
  const response = await api.get('/facebook/forms', {
    params: { page_id: pageId },
  });
  return response.data;
}

export async function getFacebookLeads(params: {
  page_id: string;
  form_id: string;
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
