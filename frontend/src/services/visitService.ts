import api from './authService';

export const markSiteAsVisited = async (siteId: number) => {
  const response = await api.post(`/sites/${siteId}/visit`);
  return response.data;
};

export const unmarkSiteAsVisited = async (siteId: number) => {
  const response = await api.delete(`/sites/${siteId}/visit`);
  return response.data;
};

export const getMyVisitedSites = async () => {
  const response = await api.get('/sites/my-visited');
  return response.data;
};
