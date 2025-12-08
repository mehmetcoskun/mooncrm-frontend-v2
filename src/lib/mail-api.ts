import axios from 'axios';

const mailSchedulerApi = axios.create({
  baseURL: import.meta.env.VITE_MAIL_SCHEDULER_API_URL,
});

export default mailSchedulerApi;