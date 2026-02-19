import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from './store/useStore';
import StatsCards from './components/StatsCards';
import AlertPanel from './components/AlertPanel';
import PanelGrid from './components/PanelGrid';
import PanelDetailModal from './components/PanelDetailModal';
import AnalyticsCharts from './components/AnalyticsCharts';
import StatusBreakdown from './components/StatusBreakdown';
import ImageUpload from './components/ImageUpload';
import SettingsPanel from './components/SettingsPanel';
import HardwareStatus from './components/HardwareStatus';
import WorkOrders from './components/WorkOrders';
import DiagnosticsPanel from './components/DiagnosticsPanel';
import LandingPage from './pages/LandingPage';
import Chatbot from './components/Chatbot';
import { database, ref, onValue } from './services/firebase';
import './index.css';
import './pages/LandingPage.css';

/* ========================================
   SVG ICONS
   ======================================== */
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3"/>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
);

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="4" rx="1"/>
    <rect x="14" y="10" width="7" height="11" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const SolarPanelIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="14" rx="2" fill="currentColor" opacity="0.15"/>
    <rect x="2" y="4" width="20" height="14" rx="2"/>
    <line x1="2" y1="11" x2="22" y2="11"/>
    <line x1="8" y1="4" x2="8" y2="18"/>
    <line x1="16" y1="4" x2="16" y2="18"/>
    <path d="M10 18v2M14 18v2M8 20h8"/>
  </svg>
);

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" opacity="0.3"/>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3v18h18"/>
    <path d="M18 9l-5 5-4-4-6 6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="18" cy="9" r="2" fill="currentColor"/>
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="currentColor" opacity="0.2"/>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <circle cx="12" cy="17" r="1" fill="currentColor"/>
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const HardwareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity="0.15"/>
    <rect x="4" y="4" width="16" height="16" rx="2"/>
    <circle cx="9" cy="9" r="1" fill="currentColor"/>
    <circle cx="15" cy="9" r="1" fill="currentColor"/>
    <circle cx="9" cy="15" r="1" fill="currentColor"/>
    <circle cx="15" cy="15" r="1" fill="currentColor"/>
  </svg>
);

const WorkOrderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
  </svg>
);

const DiagnosticsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const RefreshIcon = ({ spinning }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    style={{ animation: spinning ? 'spin 1s linear infinite' : 'none' }}
  >
    <path d="M23 4v6h-6M1 20v-6h6"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </svg>
);

const WifiIcon = ({ connected }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {connected ? (
      <>
        <path d="M5 12.55a11 11 0 0114 0" opacity="0.4"/>
        <path d="M1.42 9a16 16 0 0121.16 0" opacity="0.2"/>
        <path d="M8.53 16.11a6 6 0 016.95 0"/>
        <circle cx="12" cy="20" r="1.5" fill="currentColor"/>
      </>
    ) : (
      <>
        <line x1="1" y1="1" x2="23" y2="23" opacity="0.6"/>
        <path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/>
        <path d="M5 12.55a10.94 10.94 0 015.17-2.39"/>
        <circle cx="12" cy="20" r="1.5" fill="currentColor"/>
      </>
    )}
  </svg>
);

/* ========================================
   SIDEBAR COMPONENT
   ======================================== */
function Sidebar({ alertCount, activeView, onViewChange }) {
  const navItems = [
    { key: 'dashboard', icon: DashboardIcon, label: 'Dashboard' },
    { key: 'solar-array', icon: SolarPanelIcon, label: 'Solar Array' },
    { key: 'diagnostics', icon: DiagnosticsIcon, label: 'Diagnostics' },
    { key: 'analytics', icon: ChartIcon, label: 'Analytics' },
    { key: 'upload', icon: UploadIcon, label: 'AI Analysis' },
    { key: 'hardware', icon: HardwareIcon, label: 'Hardware' },
    { key: 'work-orders', icon: WorkOrderIcon, label: 'Work Orders' },
    { key: 'alerts', icon: AlertIcon, label: 'Alerts', badge: alertCount },
    { key: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg viewBox="0 0 40 40" className="helios-logo-icon">
          <circle cx="20" cy="20" r="18" fill="#FFB800" />
          <path d="M20 8L25 16H15L20 8Z" fill="white" />
          <circle cx="20" cy="24" r="8" fill="white" />
          <circle cx="20" cy="24" r="4" fill="#FFB800" />
        </svg>
        <div className="sidebar-brand">
          <span className="sidebar-brand-name">HELIOS</span>
          <span className="sidebar-brand-badge">AI</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button 
            key={item.key} 
            className={`sidebar-item ${activeView === item.key ? 'active' : ''}`}
            onClick={() => onViewChange(item.key)}
          >
            <item.icon />
            <span>{item.label}</span>
            {item.badge > 0 && (
              <span className="alert-badge alert-badge-critical" style={{ marginLeft: 'auto' }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-item" style={{ opacity: 0.6 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(249,115,22,0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>LT</span>
          </div>
          <span>L&T Techgium</span>
        </div>
      </div>
    </aside>
  );
}

/* ========================================
   HEADER COMPONENT - OPTIMIZED
   ======================================== */
function Header({ onRefresh, live, title, subtitle }) {
  const [refreshing, setRefreshing] = useState(false);
  // Update time only every 60 seconds to reduce re-renders
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000); // 60 seconds
    return () => clearInterval(t);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 1500);
  };

  const formatDate = () => {
    return time.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <header className="main-header">
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
          {title || 'Solar Farm Dashboard'}
        </h1>
        <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>{subtitle || formatDate()}</p>
      </div>

      <div className="flex items-center gap-md">
        {/* Live Status */}
        <div className={`status-badge ${live ? 'status-badge-live' : 'status-badge-offline'}`}>
          <span className={`status-dot ${live ? 'status-dot-success' : 'status-dot-error'}`} />
          <WifiIcon connected={live} />
          <span>{live ? 'LIVE' : 'OFFLINE'}</span>
        </div>

        {/* Time - show hours:minutes only */}
        <div className="time-display">
          <span className="time-value">
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
          <span className="time-label">IST</span>
        </div>

        {/* Refresh Button */}
        <button onClick={handleRefresh} className="btn btn-secondary">
          <RefreshIcon spinning={refreshing} />
          <span>Refresh</span>
        </button>
      </div>
    </header>
  );
}

/* ========================================
   LOADING SKELETON
   ======================================== */
function LoadingSkeleton() {
  return (
    <div className="main-body animate-fade-in">
      <div className="grid grid-cols-12">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="col-span-3 card" style={{ padding: 24 }}>
            <div style={{ height: 16, width: 96, background: 'var(--bg-elevated)', borderRadius: 4, marginBottom: 16 }}/>
            <div style={{ height: 40, width: 128, background: 'var(--bg-elevated)', borderRadius: 4 }}/>
          </div>
        ))}
        <div className="col-span-12 card" style={{ padding: 24 }}>
          <div style={{ height: 12, background: 'var(--bg-elevated)', borderRadius: 6 }}/>
        </div>
        <div className="col-span-8 card" style={{ padding: 24, height: 320 }}>
          <div style={{ height: 16, width: 128, background: 'var(--bg-elevated)', borderRadius: 4, marginBottom: 16 }}/>
          <div style={{ height: '100%', background: 'var(--bg-elevated)', borderRadius: 8 }}/>
        </div>
        <div className="col-span-4 card" style={{ padding: 24, height: 320 }}>
          <div style={{ height: 16, width: 96, background: 'var(--bg-elevated)', borderRadius: 4, marginBottom: 16 }}/>
          <div style={{ height: '100%', background: 'var(--bg-elevated)', borderRadius: 8 }}/>
        </div>
      </div>
    </div>
  );
}

/* ========================================
   SETTINGS VIEW
   ======================================== */
function SettingsView() {
  const [settings, setSettings] = useState({
    notifications: true,
    criticalAlerts: true,
    warningAlerts: true,
    autoRefresh: true,
    refreshInterval: 30,
    darkMode: true,
    theme: 'enterprise',
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="main-body">
      <div className="grid grid-cols-12">
        {/* Notifications */}
        <div className="col-span-6 card">
          <div className="card-header">
            <h3 className="card-title">Notification Settings</h3>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'notifications', label: 'Enable Notifications', desc: 'Receive alerts and updates' },
              { key: 'criticalAlerts', label: 'Critical Alerts', desc: 'Get notified for critical panel failures' },
              { key: 'warningAlerts', label: 'Warning Alerts', desc: 'Get notified for degraded panels' },
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, background: 'var(--bg-elevated)' }}>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{item.label}</p>
                  <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
                <button 
                  onClick={() => toggleSetting(item.key)}
                  style={{
                    width: 48,
                    height: 28,
                    borderRadius: 14,
                    padding: 2,
                    cursor: 'pointer',
                    border: 'none',
                    background: settings[item.key] ? '#22c55e' : 'var(--bg-card)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    background: '#fff',
                    transition: 'all 0.2s ease',
                    transform: settings[item.key] ? 'translateX(20px)' : 'translateX(0)'
                  }}/>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Display Settings */}
        <div className="col-span-6 card">
          <div className="card-header">
            <h3 className="card-title">Display Settings</h3>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, background: 'var(--bg-elevated)' }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Auto Refresh</p>
                <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>Automatically update panel data</p>
              </div>
              <button 
                onClick={() => toggleSetting('autoRefresh')}
                style={{
                  width: 48, height: 28, borderRadius: 14, padding: 2, cursor: 'pointer', border: 'none',
                  background: settings.autoRefresh ? '#22c55e' : 'var(--bg-card)', transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: 24, height: 24, borderRadius: 12, background: '#fff', transition: 'all 0.2s ease',
                  transform: settings.autoRefresh ? 'translateX(20px)' : 'translateX(0)' }}/>
              </button>
            </div>

            <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-elevated)' }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Refresh Interval</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[15, 30, 60, 120].map(val => (
                  <button
                    key={val}
                    onClick={() => setSettings(prev => ({ ...prev, refreshInterval: val }))}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
                      border: settings.refreshInterval === val ? '2px solid #f59e0b' : '1px solid var(--border-default)',
                      background: settings.refreshInterval === val ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-card)',
                      color: settings.refreshInterval === val ? '#f59e0b' : 'var(--text-muted)'
                    }}
                  >
                    {val}s
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-elevated)' }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Theme</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['enterprise', 'dark', 'light'].map(theme => (
                  <button
                    key={theme}
                    onClick={() => setSettings(prev => ({ ...prev, theme }))}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize',
                      border: settings.theme === theme ? '2px solid #f59e0b' : '1px solid var(--border-default)',
                      background: settings.theme === theme ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-card)',
                      color: settings.theme === theme ? '#f59e0b' : 'var(--text-muted)'
                    }}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="col-span-12 card">
          <div className="card-header">
            <h3 className="card-title">System Information</h3>
          </div>
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: 'Version', value: 'v1.0.0' },
              { label: 'Backend', value: 'FastAPI + Groq' },
              { label: 'Database', value: 'Firebase Realtime' },
              { label: 'AI Models', value: 'Llama 3.3 + BLIP' },
            ].map(item => (
              <div key={item.label} style={{ padding: 16, borderRadius: 12, background: 'var(--bg-elevated)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>{item.label}</p>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================
   MAIN APP COMPONENT
   ======================================== */
export default function App() {
  const {
    panels, farmStats, alerts, loading,
    fetchPanels, fetchFarmStats, fetchAlerts,
    setPanels, setAlerts, setFarmStats,
  } = useStore();

  const [selectedPanel, setSelectedPanel] = useState(null);
  const [live, setLive] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    fetchPanels();
    fetchFarmStats();
    fetchAlerts();
  }, []);

  useEffect(() => {
    const panelsRef = ref(database, 'panels');
    const alertsRef = ref(database, 'alerts');
    const statsRef = ref(database, 'farmStats');

    const unsubPanels = onValue(panelsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const panelList = Object.values(data);
        setPanels(panelList);
        setLive(true);
      }
    }, (error) => {
      console.error('Firebase panels listener error:', error);
    });

    const unsubAlerts = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const alertList = Object.entries(data).map(([key, val]) => ({ alertId: key, ...val }));
        setAlerts(alertList);
      }
    });

    const unsubStats = onValue(statsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setFarmStats(data);
    });

    return () => {
      unsubPanels();
      unsubAlerts();
      unsubStats();
    };
  }, []);

  const handleRefresh = () => {
    fetchPanels();
    fetchFarmStats();
    fetchAlerts();
  };

  const activeAlerts = alerts?.filter(a => !a.resolved) || [];

  const viewConfig = {
    'dashboard': { title: 'Solar Farm Dashboard', subtitle: null },
    'solar-array': { title: 'Solar Panel Array', subtitle: 'Real-time panel monitoring and diagnostics' },
    'diagnostics': { title: 'AI Diagnostics Center', subtitle: 'System health monitoring and predictive analysis' },
    'analytics': { title: 'Analytics & Reports', subtitle: 'Performance metrics and trend analysis' },
    'upload': { title: 'AI Image Analysis', subtitle: 'Upload thermal/visual images for AI diagnostics' },
    'hardware': { title: 'Hardware Infrastructure', subtitle: 'Connected devices and data pipeline status' },
    'work-orders': { title: 'Work Orders', subtitle: 'Maintenance task management and field operations' },
    'alerts': { title: 'Alert Management', subtitle: `${activeAlerts.length} active alerts requiring attention` },
    'settings': { title: 'System Settings', subtitle: 'Configure application preferences' },
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-12">
            <div className="col-span-12">
              <StatsCards farmStats={farmStats} />
            </div>
            <div className="col-span-12">
              <StatusBreakdown farmStats={farmStats} />
            </div>
            <div className="col-span-12">
              <AnalyticsCharts farmStats={farmStats} panels={panels} />
            </div>
            <div className="col-span-8">
              <PanelGrid panels={panels} onPanelClick={(panel) => setSelectedPanel(panel)} />
            </div>
            <div className="col-span-4">
              <AlertPanel alerts={alerts} />
            </div>
          </div>
        );

      case 'solar-array':
        return (
          <div className="grid grid-cols-12">
            <div className="col-span-12">
              <StatsCards farmStats={farmStats} />
            </div>
            <div className="col-span-12">
              <PanelGrid panels={panels} onPanelClick={(panel) => setSelectedPanel(panel)} fullscreen />
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="grid grid-cols-12">
            <div className="col-span-12">
              <StatsCards farmStats={farmStats} />
            </div>
            <div className="col-span-12">
              <AnalyticsCharts farmStats={farmStats} panels={panels} expanded />
            </div>
            <div className="col-span-12">
              <StatusBreakdown farmStats={farmStats} />
            </div>
          </div>
        );

      case 'alerts':
        return (
          <div className="grid grid-cols-12">
            <div className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { label: 'Total Alerts', value: alerts?.length || 0, color: '#64748b' },
                { label: 'Critical', value: alerts?.filter(a => a.severity === 'critical').length || 0, color: '#ef4444' },
                { label: 'Warning', value: alerts?.filter(a => a.severity === 'warning').length || 0, color: '#f59e0b' },
                { label: 'Resolved', value: alerts?.filter(a => a.resolved).length || 0, color: '#22c55e' },
              ].map(stat => (
                <div key={stat.label} className="card" style={{ padding: 20 }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>{stat.label}</p>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color: stat.color, fontFamily: 'JetBrains Mono, monospace' }}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="col-span-12">
              <AlertPanel alerts={alerts} expanded />
            </div>
          </div>
        );

      case 'settings':
        return <SettingsPanel isOpen={true} onClose={() => setActiveView('dashboard')} />;

      case 'upload':
        return (
          <div className="grid grid-cols-12">
            <div className="col-span-12">
              <ImageUpload />
            </div>
          </div>
        );

      case 'diagnostics':
        return (
          <div className="grid grid-cols-12">
            <div className="col-span-12">
              <DiagnosticsPanel />
            </div>
          </div>
        );

      case 'hardware':
        return (
          <div className="grid grid-cols-12">
            <div className="col-span-12">
              <HardwareStatus />
            </div>
          </div>
        );

      case 'work-orders':
        return (
          <div className="grid grid-cols-12">
            <div className="col-span-12">
              <WorkOrders />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show landing page first
  if (showLanding) {
    return <LandingPage onEnterDashboard={() => setShowLanding(false)} />;
  }

  return (
    <>
      <Sidebar alertCount={activeAlerts.length} activeView={activeView} onViewChange={setActiveView} />
      
      <main className="main-content">
        <Header onRefresh={handleRefresh} live={live} {...viewConfig[activeView]} />

        <AnimatePresence mode="wait">
          {loading && panels.length === 0 ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <LoadingSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key={activeView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="main-body"
            >
              {renderContent()}

              {/* Footer */}
              <footer style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, color: 'rgba(245,158,11,0.6)' }}>
                    <BoltIcon />
                  </div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>HELIOS AI v1.0</span>
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  L&T Techgium 2026 • Team R.C. Patel
                </span>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Chatbot - Only show on dashboard, not landing page */}
      {!showLanding && <Chatbot />}

      <AnimatePresence>
        {selectedPanel && (
          <PanelDetailModal
            panel={selectedPanel}
            onClose={() => setSelectedPanel(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
