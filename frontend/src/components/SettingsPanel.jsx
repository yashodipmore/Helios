import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

/* Icons */
const SettingsIcon = () => (
  <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

const CloseIcon = () => (
  <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

const CheckIcon = () => (
  <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

/* Toggle Switch Component */
function Toggle({ enabled, onToggle, label }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{label}</span>
      <motion.button
        onClick={onToggle}
        style={{
          width: 48,
          height: 26,
          borderRadius: 13,
          border: 'none',
          cursor: 'pointer',
          background: enabled ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
          padding: 3,
          display: 'flex',
          justifyContent: enabled ? 'flex-end' : 'flex-start',
        }}
      >
        <motion.div
          layout
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#fff',
          }}
        />
      </motion.button>
    </div>
  );
}

/* Select Dropdown */
function Select({ value, onChange, options, label }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid var(--border-default)',
          borderRadius: 8,
          padding: '6px 12px',
          color: 'var(--text-primary)',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: '#1a1a2e' }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function SettingsPanel({ isOpen, onClose }) {
  const { settings, updateSettings, resetSettings } = useStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 380,
            height: '100%',
            background: 'linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%)',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            overflow: 'auto',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ color: 'var(--accent)' }}>
                <SettingsIcon />
              </div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#fff' }}>
                Settings
              </h2>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 8,
                padding: 8,
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              <CloseIcon />
            </motion.button>
          </div>

          {/* Content */}
          <div style={{ padding: 24 }}>
            {/* Display Section */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ 
                fontSize: 11, 
                fontWeight: 600, 
                color: 'rgba(255,255,255,0.4)', 
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 8 
              }}>
                Display
              </h3>
              <div style={{ 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: 12, 
                padding: '4px 16px',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <Toggle
                  label="Compact View"
                  enabled={settings.compactView}
                  onToggle={() => updateSettings({ compactView: !settings.compactView })}
                />
                <Toggle
                  label="Show Demo Controls"
                  enabled={settings.showDemoControls}
                  onToggle={() => updateSettings({ showDemoControls: !settings.showDemoControls })}
                />
              </div>
            </div>

            {/* Units Section */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ 
                fontSize: 11, 
                fontWeight: 600, 
                color: 'rgba(255,255,255,0.4)', 
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 8 
              }}>
                Units
              </h3>
              <div style={{ 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: 12, 
                padding: '4px 16px',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <Select
                  label="Temperature"
                  value={settings.temperatureUnit}
                  onChange={(v) => updateSettings({ temperatureUnit: v })}
                  options={[
                    { value: 'celsius', label: 'Celsius (°C)' },
                    { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
                  ]}
                />
                <Select
                  label="Power"
                  value={settings.powerUnit}
                  onChange={(v) => updateSettings({ powerUnit: v })}
                  options={[
                    { value: 'kW', label: 'Kilowatts (kW)' },
                    { value: 'W', label: 'Watts (W)' },
                    { value: 'MW', label: 'Megawatts (MW)' },
                  ]}
                />
              </div>
            </div>

            {/* Notifications Section */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ 
                fontSize: 11, 
                fontWeight: 600, 
                color: 'rgba(255,255,255,0.4)', 
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 8 
              }}>
                Notifications
              </h3>
              <div style={{ 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: 12, 
                padding: '4px 16px',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <Toggle
                  label="Alert Sounds"
                  enabled={settings.alertSounds}
                  onToggle={() => updateSettings({ alertSounds: !settings.alertSounds })}
                />
                <Select
                  label="Refresh Interval"
                  value={settings.refreshInterval}
                  onChange={(v) => updateSettings({ refreshInterval: parseInt(v) })}
                  options={[
                    { value: 10000, label: '10 seconds' },
                    { value: 30000, label: '30 seconds' },
                    { value: 60000, label: '1 minute' },
                    { value: 300000, label: '5 minutes' },
                  ]}
                />
              </div>
            </div>

            {/* System Info */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ 
                fontSize: 11, 
                fontWeight: 600, 
                color: 'rgba(255,255,255,0.4)', 
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 8 
              }}>
                System
              </h3>
              <div style={{ 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: 12, 
                padding: 16,
                border: '1px solid rgba(255,255,255,0.06)',
                fontSize: 13,
                color: 'rgba(255,255,255,0.6)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Version</span>
                  <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>1.0.0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Backend</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>FastAPI</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>AI Model</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>LLaMA 3.3 70B + Gemini Vision</span>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <motion.button
              onClick={resetSettings}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 10,
                color: '#ef4444',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Reset to Defaults
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
