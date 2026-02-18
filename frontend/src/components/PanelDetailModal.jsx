import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzePanel, getThermalImage } from '../services/api';

const statusConfig = {
  healthy: { color: '#22c55e', label: 'OPERATIONAL', icon: '✓', bg: 'rgba(34, 197, 94, 0.1)' },
  warning: { color: '#f59e0b', label: 'DEGRADED', icon: '◐', bg: 'rgba(245, 158, 11, 0.1)' },
  critical: { color: '#ef4444', label: 'CRITICAL', icon: '✕', bg: 'rgba(239, 68, 68, 0.1)' },
};

/* HELIOS Logo */
const HeliosLogo = ({ size = 28 }) => (
  <svg viewBox="0 0 40 40" style={{ width: size, height: size }}>
    <defs>
      <linearGradient id="modalSunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD000" />
        <stop offset="100%" stopColor="#FF9500" />
      </linearGradient>
    </defs>
    <circle cx="20" cy="20" r="14" fill="url(#modalSunGrad)" />
    <circle cx="20" cy="21" r="5" fill="white" />
  </svg>
);

/* Enhanced SVG Icons */
const CloseIcon = () => (
  <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

const BrainIcon = () => (
  <svg style={{ width: 22, height: 22 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96.44 2.5 2.5 0 01-2.96-3.08 3 3 0 01-.34-5.58 2.5 2.5 0 011.32-4.24 2.5 2.5 0 013.44-3.54zM14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 004.96.44 2.5 2.5 0 002.96-3.08 3 3 0 00.34-5.58 2.5 2.5 0 00-1.32-4.24 2.5 2.5 0 00-3.44-3.54z"/>
  </svg>
);

const CheckIcon = () => (
  <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const LoaderIcon = () => (
  <motion.svg 
    style={{ width: 18, height: 18 }} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  >
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </motion.svg>
);

const LocationIcon = () => (
  <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

/* Enhanced Metric Card */
function MetricCard({ label, value, unit, deviation, color, icon }) {
  const isNeg = deviation && deviation < 0;
  return (
    <motion.div 
      className="metric-card" 
      style={{ 
        background: `linear-gradient(145deg, ${color}12 0%, ${color}04 100%)`,
        border: `1px solid ${color}25`,
        borderRadius: 16,
        padding: '16px 18px',
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{ y: -2, boxShadow: `0 8px 24px ${color}15` }}
      transition={{ duration: 0.2 }}
    >
      {/* Top accent */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 16, 
        right: 16, 
        height: 2, 
        background: `linear-gradient(90deg, ${color} 0%, ${color}40 100%)`,
        borderRadius: '0 0 2px 2px',
      }}/>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <p style={{ 
          fontSize: '0.6875rem', 
          fontWeight: 600, 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em' 
        }}>{label}</p>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          fontSize: '0.875rem',
        }}>
          {icon || '⚡'}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ 
          fontSize: '1.75rem', 
          fontWeight: 700, 
          fontFamily: 'JetBrains Mono, monospace',
          color: color,
          lineHeight: 1,
        }}>{value}</span>
        <span style={{ 
          fontSize: '0.875rem', 
          fontWeight: 500, 
          color: color, 
          opacity: 0.7 
        }}>{unit}</span>
      </div>
      
      {deviation !== null && deviation !== undefined && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6, 
          marginTop: 10,
          padding: '6px 10px',
          borderRadius: 8,
          background: isNeg ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          border: `1px solid ${isNeg ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
        }}>
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none"
            style={{ color: isNeg ? '#ef4444' : '#22c55e' }}
          >
            {isNeg ? (
              <path d="M6 10L2 6H5V2H7V6H10L6 10Z" fill="currentColor"/>
            ) : (
              <path d="M6 2L10 6H7V10H5V6H2L6 2Z" fill="currentColor"/>
            )}
          </svg>
          <span style={{ 
            fontSize: '0.6875rem', 
            fontWeight: 600, 
            color: isNeg ? '#ef4444' : '#22c55e',
          }}>
            {Math.abs(deviation)}% from baseline
          </span>
        </div>
      )}
    </motion.div>
  );
}

/* Enhanced Analysis Step */
function AnalysisStep({ step, currentStep, label, description }) {
  const isActive = currentStep === step;
  const isDone = currentStep > step;
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: step * 0.1 }}
      style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: 14,
        padding: '14px 16px',
        borderRadius: 12,
        background: isActive ? 'rgba(167, 139, 250, 0.1)' : isDone ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isActive ? 'rgba(167, 139, 250, 0.3)' : isDone ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)'}`,
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        background: isDone ? 'rgba(34, 197, 94, 0.2)' : isActive ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${isDone ? 'rgba(34, 197, 94, 0.3)' : isActive ? 'rgba(167, 139, 250, 0.3)' : 'rgba(255,255,255,0.1)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isDone ? '#22c55e' : isActive ? '#a78bfa' : 'var(--text-muted)',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 700,
        fontSize: '0.875rem',
      }}>
        {isDone ? <CheckIcon /> : isActive ? <LoaderIcon /> : step}
      </div>
      <div style={{ flex: 1 }}>
        <span style={{ 
          fontSize: '0.8125rem', 
          fontWeight: 600, 
          color: isDone ? '#22c55e' : isActive ? '#a78bfa' : 'var(--text-secondary)',
          display: 'block',
        }}>{label}</span>
        {description && (
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>{description}</span>
        )}
      </div>
      {isDone && (
        <span style={{ 
          fontSize: '0.625rem', 
          fontWeight: 600, 
          color: '#22c55e',
          padding: '4px 8px',
          background: 'rgba(34, 197, 94, 0.15)',
          borderRadius: 6,
        }}>
          COMPLETE
        </span>
      )}
    </motion.div>
  );
}

export default function PanelDetailModal({ panel, onClose }) {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [thermalImage, setThermalImage] = useState(null);
  const [step, setStep] = useState(0);

  if (!panel) return null;

  const cfg = statusConfig[panel.status] || statusConfig.healthy;
  const expectedV = 40.5, expectedI = 9.1, expectedP = 369;
  const devV = ((panel.voltage - expectedV) / expectedV * 100).toFixed(1);
  const devI = ((panel.current - expectedI) / expectedI * 100).toFixed(1);
  const devP = ((panel.power - expectedP) / expectedP * 100).toFixed(1);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysisResult(null);
    setStep(0);

    try {
      setStep(1);
      try {
        const thermalRes = await getThermalImage(panel.id);
        setThermalImage(thermalRes.data.image_url);
      } catch { setThermalImage(null); }

      setStep(2);
      const res = await analyzePanel(panel.id);
      setStep(3);
      await new Promise(r => setTimeout(r, 600));
      setAnalysisResult(res.data);
    } catch (err) {
      console.error('Analysis failed:', err);
      setAnalysisResult({ error: 'Analysis failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="modal-backdrop"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        onClick={e => e.stopPropagation()}
        className="modal"
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>{panel.id}</h2>
            <span 
              style={{ 
                padding: '4px 12px', 
                borderRadius: 8, 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: `${cfg.color}20`, 
                color: cfg.color, 
                border: `1px solid ${cfg.color}30` 
              }}
            >
              {cfg.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>Row {panel.row} • Pos {panel.position}</span>
            <button onClick={onClose} className="modal-close">
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Metrics Grid */}
          <div>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Real-Time Telemetry</h3>
            <div className="metric-grid">
              <MetricCard label="Voltage" value={panel.voltage} unit="V" deviation={parseFloat(devV)} color="#f59e0b" />
              <MetricCard label="Current" value={panel.current} unit="A" deviation={parseFloat(devI)} color="#3b82f6" />
              <MetricCard label="Power" value={panel.power} unit="W" deviation={parseFloat(devP)} color="#22c55e" />
              <MetricCard label="Temperature" value={panel.temperature} unit="°C" deviation={null} color="#f97316" />
            </div>
          </div>

          {/* Efficiency Bar */}
          {panel.efficiency && (
            <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Panel Efficiency</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: panel.efficiency > 90 ? '#22c55e' : panel.efficiency > 75 ? '#f59e0b' : '#ef4444' }}>{panel.efficiency}%</span>
              </div>
              <div className="progress-bar">
                <div
                  style={{ width: `${Math.min(panel.efficiency, 100)}%`, transition: 'width 0.3s ease' }}
                  className={`progress-fill ${panel.efficiency > 90 ? 'progress-fill-success' : panel.efficiency > 75 ? 'progress-fill-warning' : 'progress-fill-error'}`}
                />
              </div>
            </div>
          )}

          {/* Existing Diagnosis */}
          {panel.diagnosis && (
            <div style={{ padding: 16, borderRadius: 12, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, color: '#f59e0b' }}>Existing Diagnosis</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{panel.diagnosis}</p>
            </div>
          )}

          {/* AI Analysis Button */}
          {!analysisResult && !loading && (
            <button onClick={handleAnalyze} className="ai-analyze-btn">
              <BrainIcon />
              Run Complete AI Analysis
            </button>
          )}

          {/* Loading Steps */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AnalysisStep step={1} currentStep={step} label="Generating thermal image..." />
              <AnalysisStep step={2} currentStep={step} label="Running AI vision analysis..." />
              <AnalysisStep step={3} currentStep={step} label="Computing root cause with LLM..." />
            </div>
          )}

          {/* Results */}
          {analysisResult && !analysisResult.error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a78bfa' }}>AI Analysis Results</h3>
                <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>{analysisResult.total_time_seconds}s total</span>
              </div>

              {/* Thermal Image */}
              {thermalImage && (
                <div style={{ padding: 16, borderRadius: 12, background: 'rgba(249, 115, 22, 0.05)', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, color: '#f97316' }}>Thermal Imaging</p>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <img src={thermalImage} alt="Thermal" style={{ borderRadius: 12, width: 192, height: 192, objectFit: 'cover', border: '1px solid var(--border-default)' }} />
                  </div>
                </div>
              )}

              {/* Virtual EL */}
              <div style={{ padding: 16, borderRadius: 12, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, color: '#3b82f6' }}>Virtual EL Analysis</p>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  {analysisResult.virtual_el?.image_url && (
                    <img src={analysisResult.virtual_el.image_url} alt="Virtual EL" style={{ width: 96, height: 96, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border-default)' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {analysisResult.virtual_el?.defects_detected
                        ? `Micro-cracks detected: ${analysisResult.virtual_el.defect_count} defects found`
                        : 'No micro-cracks detected — panel structure intact'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Confidence: <span style={{ fontWeight: 700, color: '#3b82f6' }}>{(analysisResult.virtual_el?.confidence * 100).toFixed(0)}%</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Root Cause */}
              <div className="root-cause-card">
                <div className="root-cause-header">
                  <span className="root-cause-label">Root Cause Analysis</span>
                  <span className="root-cause-confidence">
                    {(analysisResult.root_cause_analysis?.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
                <p className="root-cause-title">{analysisResult.root_cause_analysis?.root_cause}</p>
                <p className="root-cause-reasoning">{analysisResult.root_cause_analysis?.reasoning}</p>
                <div className="root-cause-action">
                  <p className="root-cause-action-label">Recommended Action</p>
                  <p className="root-cause-action-text">{analysisResult.root_cause_analysis?.action}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
                  <div>
                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Priority</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: analysisResult.root_cause_analysis?.priority === 'critical' ? '#ef4444' : analysisResult.root_cause_analysis?.priority === 'high' ? '#f97316' : '#22c55e' }}>{analysisResult.root_cause_analysis?.priority?.toUpperCase()}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Cost</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>₹{analysisResult.root_cause_analysis?.estimated_cost}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>{analysisResult.root_cause_analysis?.processing_time}s</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {analysisResult?.error && (
            <div style={{ padding: 16, borderRadius: 12, textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: 8, color: '#ef4444' }}>{analysisResult.error}</p>
              <button onClick={handleAnalyze} style={{ fontSize: '0.875rem', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5' }}>Retry Analysis</button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
