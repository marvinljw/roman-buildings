import api from './authService';

export const getChatResponse = async (message: string) => {
  const response = await api.post('/chat', { message });
  return response.data;
};
