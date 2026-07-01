import api from './authService';

export const getSites = async () => {
  const response = await api.get('/sites');
  return response.data;
};

export const createSite = async (siteData: any) => {
  const response = await api.post('/sites', siteData);
  return response.data;
};

export const updateSite = async (siteId: number, data: any) => {
  const response = await api.put(`/sites/${siteId}`, data);
  return response.data;
};
