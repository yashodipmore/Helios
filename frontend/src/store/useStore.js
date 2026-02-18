import { create } from 'zustand';
import { getPanels, getFarmStats, getAlerts } from '../services/api';

const useStore = create((set, get) => ({
  panels: [],
  selectedPanel: null,
  alerts: [],
  farmStats: null,
  loading: false,
  error: null,
  analysisResult: null,
  analysisLoading: false,

  setSelectedPanel: (panel) => set({ selectedPanel: panel, analysisResult: null }),
  clearSelectedPanel: () => set({ selectedPanel: null, analysisResult: null }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setAnalysisLoading: (loading) => set({ analysisLoading: loading }),

  fetchPanels: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getPanels();
      const panels = Array.isArray(res.data) ? res.data : Object.values(res.data || {});
      set({ panels, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchFarmStats: async () => {
    try {
      const res = await getFarmStats();
      set({ farmStats: res.data });
    } catch (err) {
      console.error('Failed to fetch farm stats:', err);
    }
  },

  fetchAlerts: async () => {
    try {
      const res = await getAlerts();
      const alerts = Array.isArray(res.data) ? res.data : Object.values(res.data || {});
      set({ alerts });
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  },

  setPanels: (panels) => set({ panels }),
  setAlerts: (alerts) => set({ alerts }),
  setFarmStats: (stats) => set({ farmStats: stats }),
}));

export default useStore;
