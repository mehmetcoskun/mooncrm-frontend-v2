import mailSchedulerApi from '@/lib/mail-api';

export const sendBulkEmailScheduler = async (
  payload: Record<string, unknown>
) => {
  return mailSchedulerApi.post('/email', payload);
};

export const checkEmailSchedulerStatus = async (key: string) => {
  return mailSchedulerApi.get(`/status/${key}`);
};

export const stopEmailScheduler = async (key: string) => {
  return mailSchedulerApi.post('/stop', { key });
};
