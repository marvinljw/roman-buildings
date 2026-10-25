import axios from 'axios';
import api from './authService';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

// Sends the whole conversation (oldest first); the backend adds its own instructions and calls the AI.
export const getChatResponse = async (messages: ChatTurn[]): Promise<string> => {
  const response = await api.post('/chat', { messages });
  return response.data.reply;
};

// The backend explains AI problems (expired key, no credit, ...) in an `error` field.
export const chatErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { error?: unknown } | undefined)?.error;
    if (typeof message === 'string' && message) return message;
    if (!error.response) return "Couldn't reach the app's server. Is the backend running?";
  }
  return 'Something went wrong. Please try again.';
};
