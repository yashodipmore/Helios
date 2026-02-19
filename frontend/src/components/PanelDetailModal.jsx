import { useState } from 'react';
import { analyzePanel, getThermalImage } from '../services/api';

/* Enterprise Minimal - Panel Detail Modal */

const statusCfg = {
  healthy: { color: '#22c55e', label: 'OPERATIONAL' },
  warning: { color: '#f59e0b', label: 'DEGRADED' },
  critical: { color: '#ef4444', label: 'CRITICAL' },
};

export default function PanelDetailModal({ panel, onClose }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [thermal, setThermal] = useState(null);

  if (!panel) return null;

  const cfg = statusCfg[panel.status] || statusCfg.healthy;
  const expV = 40.5, expI = 9.1, expP = 369;
  const devV = ((panel.voltage - expV) / expV * 100).toFixed(1);
  const devI = ((panel.current - expI) / expI * 100).toFixed(1);
  const devP = ((panel.power - expP) / expP * 100).toFixed(1);

  const handleAnalyze = async () => {
    setLoading(true); setResult(null);
    try {
      try { const t = await getThermalImage(panel.id); setThermal(t.data?.image_url); } catch { setThermal(null); }
      const res = await analyzePanel(panel.id);
      setResult(res.data);
    } catch (err) {
      setResult({ error: 'Analysis failed' });
    } finally { setLoading(false); }
  };

  const cardStyle = { padding: 12, borderRadius: 8, background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' };
  const labelStyle = { fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 };
  const valueStyle = { fontSize: 18, fontWeight: 700, fontFamily: 'monospace' };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-default)' }}>
        
        {/* Header */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>{panel.id}</span>
            <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: `${cfg.color}20`, color: cfg.color }}>{cfg.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Row {panel.row} • Pos {panel.position}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>×</button>
          </div>
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'Voltage', value: panel.voltage, unit: 'V', dev: devV, color: '#f59e0b' },
              { label: 'Current', value: panel.current, unit: 'A', dev: devI, color: '#3b82f6' },
              { label: 'Power', value: panel.power, unit: 'W', dev: devP, color: '#22c55e' },
              { label: 'Temp', value: panel.temperature, unit: '°C', color: '#f97316' },
            ].map(m => (
              <div key={m.label} style={{ ...cardStyle, borderLeft: `3px solid ${m.color}` }}>
                <div style={labelStyle}>{m.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                  <span style={{ ...valueStyle, color: m.color }}>{m.value}</span>
                  <span style={{ fontSize: 11, color: m.color }}>{m.unit}</span>
                </div>
                {m.dev && <span style={{ fontSize: 10, color: parseFloat(m.dev) < 0 ? '#ef4444' : '#22c55e' }}>{m.dev}%</span>}
              </div>
            ))}
          </div>

          {/* Efficiency */}
          {panel.efficiency && (
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>EFFICIENCY</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', color: panel.efficiency > 90 ? '#22c55e' : '#f59e0b' }}>{panel.efficiency}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--border-subtle)' }}>
                <div style={{ height: '100%', width: `${panel.efficiency}%`, borderRadius: 3, background: panel.efficiency > 90 ? '#22c55e' : '#f59e0b' }} />
              </div>
            </div>
          )}

          {/* Diagnosis */}
          {panel.diagnosis && (
            <div style={{ ...cardStyle, borderLeft: '3px solid #f59e0b' }}>
              <div style={labelStyle}>Existing Diagnosis</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{panel.diagnosis}</p>
            </div>
          )}

          {/* AI Button */}
          {!result && !loading && (
            <button onClick={handleAnalyze} style={{ padding: 12, borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>Run AI Analysis
            </button>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: 8, animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.22-8.56"/></svg>
              <span style={{ fontSize: 12 }}>Analyzing panel...</span>
            </div>
          )}

          {/* Results */}
          {result && !result.error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>AI ANALYSIS RESULTS</div>
              
              {thermal && (
                <div style={cardStyle}>
                  <div style={labelStyle}>Thermal Image</div>
                  <img src={thermal} alt="Thermal" style={{ width: 120, height: 120, borderRadius: 6, objectFit: 'cover' }} />
                </div>
              )}

              {result.virtual_el && (
                <div style={cardStyle}>
                  <div style={labelStyle}>Virtual EL</div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {result.virtual_el.image_url && <img src={result.virtual_el.image_url} alt="EL" style={{ width: 64, height: 64, borderRadius: 4 }} />}
                    <div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {result.virtual_el.defects_detected ? `${result.virtual_el.defect_count} defects found` : 'No defects'}
                      </p>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Confidence: {(result.virtual_el.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {result.root_cause_analysis && (
                <div style={{ ...cardStyle, borderLeft: '3px solid #a78bfa' }}>
                  <div style={labelStyle}>Root Cause</div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{result.root_cause_analysis.root_cause}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>{result.root_cause_analysis.reasoning}</p>
                  <div style={{ padding: 10, borderRadius: 4, background: 'rgba(167,139,250,0.1)' }}>
                    <div style={{ fontSize: 10, color: '#a78bfa', marginBottom: 4 }}>RECOMMENDED ACTION</div>
                    <p style={{ fontSize: 12, color: 'var(--text-primary)' }}>{result.root_cause_analysis.action}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Priority</span>
                      <p style={{ fontSize: 12, fontWeight: 700, color: result.root_cause_analysis.priority === 'critical' ? '#ef4444' : '#f59e0b' }}>{result.root_cause_analysis.priority?.toUpperCase()}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Est. Cost</span>
                      <p style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>₹{result.root_cause_analysis.estimated_cost}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {result?.error && (
            <div style={{ padding: 14, textAlign: 'center', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p style={{ color: '#ef4444', marginBottom: 8 }}>{result.error}</p>
              <button onClick={handleAnalyze} style={{ background: 'none', border: 'none', color: '#fca5a5', textDecoration: 'underline', cursor: 'pointer' }}>Retry</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
