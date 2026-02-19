import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// === Panels ===
export const getPanels = (status, limit) => {
  const params = {};
  if (status) params.status = status;
  if (limit) params.limit = limit;
  return api.get('/api/panels', { params });
};

export const getPanel = (panelId) => api.get(`/api/panels/${panelId}`);

export const clearPanelAlert = (panelId) => api.post(`/api/panels/${panelId}/clear-alert`);

// === Farm Stats ===
export const getFarmStats = () => api.get('/api/stats/farm-overview');

// === Alerts ===
export const getAlerts = () => api.get('/api/alerts');

export const clearAlert = (alertId) => api.post(`/api/alerts/${alertId}/clear`);

// === Analysis ===
export const analyzePanel = (panelId) =>
  api.post(`/api/demo/analyze-panel/${panelId}`);

export const analyzeThermal = (panelId) =>
  api.post(`/api/analyze/thermal-diagnosis?panel_id=${panelId}`);

export const analyzeVirtualEL = (panelId) =>
  api.post(`/api/analyze/virtual-el?panel_id=${panelId}`);

export const analyzeRootCause = (panelId) =>
  api.post(`/api/analyze/root-cause?panel_id=${panelId}`);

export const getThermalImage = (panelId) =>
  api.get(`/api/panels/${panelId}/thermal-image`);

// === History & Analytics ===
export const getPanelHistory = (panelId, start, end, limit = 100) => {
  const params = { limit };
  if (start) params.start = start;
  if (end) params.end = end;
  return api.get(`/api/history/panels/${panelId}`, { params });
};

export const getPowerTrend = (period = '7d', panelId) => {
  const params = { period };
  if (panelId) params.panel_id = panelId;
  return api.get('/api/history/analytics/power-trend', { params });
};

export const getEfficiencyTrend = (period = '30d', panelId) => {
  const params = { period };
  if (panelId) params.panel_id = panelId;
  return api.get('/api/history/analytics/efficiency-trend', { params });
};

export const getAnalyticsSummary = (period = '7d') =>
  api.get('/api/history/analytics/summary', { params: { period } });

export const getAlertsHistory = (panelId, severity, limit = 50) => {
  const params = { limit };
  if (panelId) params.panel_id = panelId;
  if (severity) params.severity = severity;
  return api.get('/api/history/alerts', { params });
};

export const getAnalysisHistory = (panelId, analysisType, limit = 20) => {
  const params = { limit };
  if (panelId) params.panel_id = panelId;
  if (analysisType) params.analysis_type = analysisType;
  return api.get('/api/history/analysis', { params });
};

// === Work Orders ===
export const getWorkOrders = (status, priority, panelId) => {
  const params = {};
  if (status) params.status = status;
  if (priority) params.priority = priority;
  if (panelId) params.panel_id = panelId;
  return api.get('/api/work-orders', { params });
};

export const createWorkOrder = (data) => api.post('/api/work-orders', data);

export const getWorkOrder = (orderId) => api.get(`/api/work-orders/${orderId}`);

export const updateWorkOrder = (orderId, data) => api.put(`/api/work-orders/${orderId}`, data);

export const completeWorkOrder = (orderId, notes) =>
  api.post(`/api/work-orders/${orderId}/complete`, null, { params: { notes } });

export const cancelWorkOrder = (orderId, reason) =>
  api.post(`/api/work-orders/${orderId}/cancel`, null, { params: { reason } });

export const markPanelMaintenance = (panelId, workType, description) =>
  api.post(`/api/work-orders/panels/${panelId}/mark-maintenance`, null, {
    params: { work_type: workType, description }
  });

export const getWorkOrderStats = () => api.get('/api/work-orders/stats/summary');

// === Hardware (Sensors & Cameras) ===
export const getSensorStatus = () => api.get('/api/hardware/sensors/status');

export const getAllPanelSensorData = () => api.get('/api/hardware/sensors/panels/all');

export const getPanelSensorData = (panelId) => api.get(`/api/hardware/sensors/panels/${panelId}`);

export const getSensorHealth = () => api.get('/api/hardware/sensors/health');

export const captureThermal = (panelId) =>
  api.post('/api/hardware/cameras/capture/thermal', null, { params: { panel_id: panelId } });

export const captureVisual = (panelId) =>
  api.post('/api/hardware/cameras/capture/visual', null, { params: { panel_id: panelId } });

export const analyzeThermalCapture = (panelId) =>
  api.post('/api/hardware/cameras/analyze/thermal', null, { params: { panel_id: panelId } });

// === Demo Controls (Mock Mode) ===
export const injectFault = (panelId, faultType, severity = 0.7) =>
  api.post('/api/hardware/sensors/demo/fault', null, {
    params: { panel_id: panelId, fault_type: faultType, severity }
  });

export const clearFault = (panelId) =>
  api.delete(`/api/hardware/sensors/demo/fault/${panelId}`);

export const getAllFaults = () => api.get('/api/hardware/sensors/demo/faults');

export const setDemoWeather = (cloudCover, ambientTemp, humidity) => {
  const params = {};
  if (cloudCover !== undefined) params.cloud_cover = cloudCover;
  if (ambientTemp !== undefined) params.ambient_temp = ambientTemp;
  if (humidity !== undefined) params.humidity = humidity;
  return api.post('/api/hardware/sensors/demo/weather', null, { params });
};

export default api;
