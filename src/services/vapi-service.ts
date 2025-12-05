import { vapiApi } from '@/lib/vapi-api';

// Vapi Assistants
export const getVapiAiAssistants = async () => {
  const response = await vapiApi.get('/assistant');
  return response.data;
};

export const createVapiAiAssistant = async (data: Record<string, unknown>) => {
  const response = await vapiApi.post('/assistant', data);
  return response.data;
};

export const getVapiAiAssistant = async (id: string) => {
  const response = await vapiApi.get(`/assistant/${id}`);
  return response.data;
};

export const updateVapiAiAssistant = async (
  id: string,
  data: Record<string, unknown>
) => {
  const response = await vapiApi.patch(`/assistant/${id}`, data);
  return response.data;
};

export const destroyVapiAiAssistant = async (id: string) => {
  const response = await vapiApi.delete(`/assistant/${id}`);
  return response.data;
};

// Vapi Credentials
export const createVapiCredential = async (data: Record<string, unknown>) => {
  const response = await vapiApi.post('/credential', data);
  return response.data;
};

// Vapi Phone Numbers
export const getVapiPhoneNumbers = async () => {
  const response = await vapiApi.get('/phone-number');
  return response.data;
};

export const createVapiPhoneNumber = async (data: Record<string, unknown>) => {
  const response = await vapiApi.post('/phone-number', data);
  return response.data;
};

export const getVapiPhoneNumber = async (id: string) => {
  const response = await vapiApi.get(`/phone-number/${id}`);
  return response.data;
};

export const updateVapiPhoneNumber = async (
  id: string,
  data: Record<string, unknown>
) => {
  const response = await vapiApi.patch(`/phone-number/${id}`, data);
  return response.data;
};

export const destroyVapiPhoneNumber = async (id: string) => {
  const response = await vapiApi.delete(`/phone-number/${id}`);
  return response.data;
};

// Vapi Calls
export const call = async (data: Record<string, unknown>) => {
  const response = await vapiApi.post('/call', data);
  return response.data;
};

export const callPhone = async (data: Record<string, unknown>) => {
  const response = await vapiApi.post('/call/phone', data);
  return response.data;
};
