import axios from 'axios';
import { getSetting } from '@/services/setting-service';

let settingsCache: Record<string, unknown> | null = null;
const fetchSettings = async () => {
  if (!settingsCache) {
    settingsCache = await getSetting();
  }
  return settingsCache;
};

let WHATSAPP_API_URL: string | undefined;
let WHATSAPP_API_KEY: string | undefined;

export const fetchWhatsappApiUrl = async () => {
  if (!WHATSAPP_API_URL) {
    const settings = await fetchSettings();
    if (settings) {
      const whatsappSettings =
        typeof settings.whatsapp_settings === 'string'
          ? JSON.parse(settings.whatsapp_settings as string)
          : settings.whatsapp_settings;

      if (whatsappSettings?.api_url) {
        WHATSAPP_API_URL = whatsappSettings.api_url as string;
      }
    }
  }
  return WHATSAPP_API_URL;
};

export const fetchWhatsappApiKey = async () => {
  if (!WHATSAPP_API_KEY) {
    const settings = await fetchSettings();
    if (settings) {
      const whatsappSettings =
        typeof settings.whatsapp_settings === 'string'
          ? JSON.parse(settings.whatsapp_settings as string)
          : settings.whatsapp_settings;

      if (whatsappSettings?.api_key) {
        WHATSAPP_API_KEY = whatsappSettings.api_key as string;
      }
    }
  }
  return WHATSAPP_API_KEY;
};

const whatsappApi = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

whatsappApi.interceptors.request.use(async (config) => {
  const baseURL = await fetchWhatsappApiUrl();
  if (baseURL) {
    config.baseURL = baseURL;
  }

  const apiKey = await fetchWhatsappApiKey();
  if (apiKey) {
    config.headers['X-Api-Key'] = apiKey;
  }

  return config;
});

const whatsappSchedulerApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const fetchWhatsappMedia = async (mediaUrl: string): Promise<string> => {
  try {
    const apiKey = await fetchWhatsappApiKey();

    if (!apiKey) {
      throw new Error('WhatsApp API key bulunamadı');
    }

    const mediaResponse = await axios.get(mediaUrl, {
      headers: {
        'X-Api-Key': apiKey,
      },
      responseType: 'blob',
    });

    const blob = mediaResponse.data;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error(
      `Medya dosyası yüklenirken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    );
  }
};

export { whatsappApi, whatsappSchedulerApi };
