import axios from 'axios';
import { getCookie } from './cookies';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const organization_id = localStorage.getItem('organization_id');
    if (organization_id) {
      config.headers['X-Organization-Id'] = organization_id;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
