import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export const AUTH_LOGOUT_EVENT = 'auth:logout';

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const clearAuthSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
};

api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    config.headers = config.headers || {};

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      clearAuthSession();
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
    }

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
