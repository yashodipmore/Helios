import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getPanels, getFarmStats, getAlerts, getWorkOrders, getSensorStatus } from '../services/api';

// Settings that persist to localStorage
const defaultSettings = {
  theme: 'dark',
  refreshInterval: 30000, // 30 seconds
  alertSounds: true,
  compactView: false,
  showDemoControls: true,
  temperatureUnit: 'celsius',
  powerUnit: 'kW',
  language: 'en',
};

const useStore = create(
  persist(
    (set, get) => ({
      // === State ===
      panels: [],
      selectedPanel: null,
      alerts: [],
      farmStats: null,
      loading: false,
      error: null,
      analysisResult: null,
      analysisLoading: false,
      workOrders: [],
      sensorStatus: null,
      
      // Settings (persisted)
      settings: defaultSettings,

      // === Panel Actions ===
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

      // === Work Orders ===
      fetchWorkOrders: async () => {
        try {
          const res = await getWorkOrders();
          set({ workOrders: res.data.work_orders || [] });
        } catch (err) {
          console.error('Failed to fetch work orders:', err);
        }
      },

      // === Hardware Status ===
      fetchSensorStatus: async () => {
        try {
          const res = await getSensorStatus();
          set({ sensorStatus: res.data });
        } catch (err) {
          console.error('Failed to fetch sensor status:', err);
        }
      },

      // === Settings Actions ===
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      
      resetSettings: () => set({ settings: defaultSettings }),
      
      setSetting: (key, value) => set((state) => ({
        settings: { ...state.settings, [key]: value }
      })),

      // === Setters ===
      setPanels: (panels) => set({ panels }),
      setAlerts: (alerts) => set({ alerts }),
      setFarmStats: (stats) => set({ farmStats: stats }),
      setWorkOrders: (orders) => set({ workOrders: orders }),

      // === Computed ===
      getCriticalPanels: () => get().panels.filter(p => p.status === 'critical'),
      getWarningPanels: () => get().panels.filter(p => p.status === 'warning'),
      getHealthyPanels: () => get().panels.filter(p => p.status === 'healthy'),
      getActiveAlerts: () => get().alerts.filter(a => !a.resolved),
      getPendingWorkOrders: () => get().workOrders.filter(o => o.status === 'pending'),
    }),
    {
      name: 'helios-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

export default useStore;
