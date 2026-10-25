import api from './authService';

// The user's "want to visit" list.
export const addToWantToVisit = async (siteId: number) => {
  const response = await api.put(`/sites/${siteId}/want`);
  return response.data;
};

export const removeFromWantToVisit = async (siteId: number) => {
  const response = await api.delete(`/sites/${siteId}/want`);
  return response.data;
};
