import api from './authService';

export const rateSite = async (siteId: number, rating: number) => {
  const response = await api.put(`/sites/${siteId}/rating`, { rating });
  return response.data;
};

export const clearSiteRating = async (siteId: number) => {
  const response = await api.delete(`/sites/${siteId}/rating`);
  return response.data;
};
