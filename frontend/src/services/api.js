import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

export const getPanels = (status, limit) => {
  const params = {};
  if (status) params.status = status;
  if (limit) params.limit = limit;
  return api.get('/api/panels', { params });
};

export const getPanel = (panelId) => api.get(`/api/panels/${panelId}`);

export const getFarmStats = () => api.get('/api/stats/farm-overview');

export const getAlerts = () => api.get('/api/alerts');

export const analyzePanel = (panelId) =>
  api.post(`/api/demo/analyze-panel/${panelId}`);

export const getThermalImage = (panelId) =>
  api.get(`/api/panels/${panelId}/thermal-image`);

export default api;
