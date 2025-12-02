import {
  whatsappSchedulerApi,
  fetchWhatsappApiUrl,
  fetchWhatsappApiKey,
} from '@/lib/whatsapp-api';

export const sendBulkTextScheduler = async ({
  customers,
  text,
  session,
  interval,
}: {
  customers: Record<string, unknown>[];
  text: string;
  session: Record<string, unknown>;
  interval: number;
}) => {
  const apiUrl = await fetchWhatsappApiUrl();
  const apiKey = await fetchWhatsappApiKey();
  return whatsappSchedulerApi.post('/message', {
    customers,
    type: 'text',
    text,
    session: session.title,
    interval,
    api_url: apiUrl,
    api_key: apiKey,
  });
};

export const sendBulkImageScheduler = async ({
  customers,
  text,
  image,
  session,
  interval,
}: {
  customers: Record<string, unknown>[];
  text: string;
  image: string;
  session: Record<string, unknown>;
  interval: number;
}) => {
  const apiUrl = await fetchWhatsappApiUrl();
  const apiKey = await fetchWhatsappApiKey();
  return whatsappSchedulerApi.post('/message', {
    customers,
    type: 'image',
    text,
    image,
    session: session.title,
    interval,
    api_url: apiUrl,
    api_key: apiKey,
  });
};

export const sendBulkFileScheduler = async ({
  customers,
  text,
  file,
  session,
  interval,
}: {
  customers: Record<string, unknown>[];
  text: string;
  file: string;
  session: Record<string, unknown>;
  interval: number;
}) => {
  const apiUrl = await fetchWhatsappApiUrl();
  const apiKey = await fetchWhatsappApiKey();
  return whatsappSchedulerApi.post('/message', {
    customers,
    type: 'file',
    text,
    file,
    session: session.title,
    interval,
    api_url: apiUrl,
    api_key: apiKey,
  });
};

export const checkWhatsappSchedulerStatus = async (key: string) => {
  return whatsappSchedulerApi.get(`/status/${key}`);
};

export const stopWhatsappScheduler = async (key: string) => {
  return whatsappSchedulerApi.post('/stop', { key });
};
