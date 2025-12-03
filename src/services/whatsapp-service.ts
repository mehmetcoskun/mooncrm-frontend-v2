import { whatsappApi, fetchWhatsappMedia } from '@/lib/whatsapp-api';

export const getSession = async (session: string) => {
  const response = await whatsappApi.get(`/sessions/${session}`);
  return response.data;
};

export const createSession = async (data: Record<string, unknown>) => {
  const response = await whatsappApi.post('/sessions', data);
  return response.data;
};

export const startSession = async (session: string) => {
  const response = await whatsappApi.post(`/sessions/${session}/start`);
  return response.data;
};

export const stopSession = async (session: string) => {
  const response = await whatsappApi.post(`/sessions/${session}/stop`);
  return response.data;
};

export const logoutSession = async (session: string) => {
  const response = await whatsappApi.post(`/sessions/${session}/logout`);
  return response.data;
};

export const sendText = async (data: Record<string, unknown>) => {
  const response = await whatsappApi.post('/sendText', data);
  return response.data;
};

export const sendImage = async (data: Record<string, unknown>) => {
  const response = await whatsappApi.post('/sendImage', data);
  return response.data;
};

export const sendFile = async (data: Record<string, unknown>) => {
  const response = await whatsappApi.post('/sendFile', data);
  return response.data;
};

export const sendSeen = async (data: Record<string, unknown>) => {
  const response = await whatsappApi.post('/sendSeen', data);
  return response.data;
};

export const startTyping = async (data: Record<string, unknown>) => {
  const response = await whatsappApi.post('/startTyping', data);
  return response.data;
};

export const stopTyping = async (data: Record<string, unknown>) => {
  const response = await whatsappApi.post('/stopTyping', data);
  return response.data;
};

export const getContact = async (contactId: string, session: string) => {
  const response = await whatsappApi.get(
    `/contacts?contactId=${contactId}&session=${session}`
  );
  return response.data;
};

export const checkExists = async (session: string, phone: string) => {
  const response = await whatsappApi.get(
    `/contacts/check-exists?session=${session}&phone=${phone}`
  );
  return response.data;
};

export const getChats = async (
  session: string,
  limit: number,
  offset: number
) => {
  const response = await whatsappApi.get(
    `/${session}/chats?limit=${limit}&offset=${offset}`
  );
  return response.data;
};

export const getChatsOverview = async (
  session: string,
  limit: number,
  offset: number
) => {
  const response = await whatsappApi.get(
    `/${session}/chats/overview?limit=${limit}&offset=${offset}`
  );
  return response.data;
};

export const getProfilePicture = async (session: string, contactId: string) => {
  const response = await whatsappApi.get(
    `/contacts/profile-picture?session=${session}&contactId=${contactId}`
  );
  return response.data;
};

export const getMessages = async (
  session: string,
  chatId: string,
  limit: number
) => {
  const response = await whatsappApi.get(
    `/${session}/chats/${chatId}/messages?&downloadMedia=true&limit=${limit}`
  );
  return response.data;
};

export const getWhatsappMedia = async (mediaUrl: string): Promise<string> => {
  return await fetchWhatsappMedia(mediaUrl);
};
