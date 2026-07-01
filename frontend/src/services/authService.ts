import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
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

export const register = async (username: string, password: string) => {
  const response = await api.post('/auth/register', { username, password });
  return response.data;
};

export default api;
