import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

export const login = async (username: string, password: string) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const getSites = async () => {
  const response = await api.get('/sites');
  return response.data;
};

export const updateSite = async (siteId: number, data: any) => {
  const response = await api.put(`/sites/${siteId}`, data);
  return response.data;
};

export const getChatResponse = async (message: string) => {
  const response = await api.post('/chat', { message });
  return response.data;
};

export default api;