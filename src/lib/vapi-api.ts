import axios from 'axios';
import { getSetting } from '@/services/setting-service';

let settingsCache: Record<string, unknown> | null = null;
const fetchSettings = async () => {
  if (!settingsCache) {
    settingsCache = await getSetting();
  }
  return settingsCache;
};

let VAPI_API_KEY: string | undefined;

export const fetchVapiApiKey = async () => {
  if (!VAPI_API_KEY) {
    const settings = await fetchSettings();
    if (settings) {
      const vapiSettings =
        typeof settings.vapi_settings === 'string'
          ? JSON.parse(settings.vapi_settings as string)
          : settings.vapi_settings;

      if (vapiSettings?.api_key) {
        VAPI_API_KEY = vapiSettings.api_key as string;
      }
    }
  }
  return VAPI_API_KEY;
};

const vapiApi = axios.create({
  baseURL: import.meta.env.VITE_VAPI_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

vapiApi.interceptors.request.use(async (config) => {
  const apiKey = await fetchVapiApiKey();
  if (apiKey) {
    config.headers.Authorization = `Bearer ${apiKey}`;
  }
  return config;
});

export { vapiApi };
