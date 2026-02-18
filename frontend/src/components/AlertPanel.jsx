import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

/* HELIOS Logo */
const HeliosLogo = ({ size = 20 }) => (
  <svg viewBox="0 0 40 40" style={{ width: size, height: size }}>
    <defs>
      <linearGradient id="alertSunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD000" />
        <stop offset="100%" stopColor="#FF9500" />
      </linearGradient>
    </defs>
    <circle cx="20" cy="20" r="14" fill="url(#alertSunGrad)" />
    <circle cx="20" cy="21" r="5" fill="white" />
  </svg>
);

const severityConfig = {
  critical: { 
    bg: 'rgba(239, 68, 68, 0.08)', 
    border: 'rgba(239, 68, 68, 0.25)', 
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.08))',
    label: 'CRITICAL',
    priority: 1,
  },
  high: { 
    bg: 'rgba(249, 115, 22, 0.08)', 
    border: 'rgba(249, 115, 22, 0.25)', 
    color: '#f97316',
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 88, 12, 0.08))',
    label: 'HIGH',
    priority: 2,
  },
  medium: { 
    bg: 'rgba(245, 158, 11, 0.08)', 
    border: 'rgba(245, 158, 11, 0.25)', 
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.08))',
    label: 'MEDIUM',
    priority: 3,
  },
  low: { 
    bg: 'rgba(59, 130, 246, 0.08)', 
    border: 'rgba(59, 130, 246, 0.25)', 
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.08))',
    label: 'LOW',
    priority: 4,
  },
};

/* Enhanced Alert Icon - NO animation for performance */
const AlertIcon = ({ severity }) => {
  const cfg = severityConfig[severity] || severityConfig.low;
  return (
    <div>
      <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2">
        {severity === 'critical' ? (
          <>
            <circle cx="12" cy="12" r="10" fill={cfg.color} opacity="0.2"/>
            <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round"/>
          </>
        ) : severity === 'high' ? (
          <>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill={cfg.color} opacity="0.2"/>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
            <circle cx="12" cy="17" r="1" fill={cfg.color}/>
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="10" fill={cfg.color} opacity="0.2"/>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill={cfg.color}/>
          </>
        )}
      </svg>
    </div>
  );
};

/* Time ago helper */
function timeAgo(timestamp) {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* Severity Summary Badge */
const SeveritySummary = ({ alerts }) => {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  alerts.forEach(a => {
    if (!a.resolved && counts[a.severity] !== undefined) counts[a.severity]++;
  });
  
  return (
    <div style={{ 
      display: 'flex', 
      gap: 6, 
      padding: '8px 12px', 
      background: 'rgba(255,255,255,0.03)', 
      borderRadius: 10,
      border: '1px solid var(--border-subtle)',
    }}>
      {Object.entries(counts).map(([sev, count]) => {
        const cfg = severityConfig[sev];
        if (count === 0) return null;
        return (
          <motion.div
            key={sev}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 6,
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
            }}
          >
            <div style={{ 
              width: 6, 
              height: 6, 
              borderRadius: '50%', 
              background: cfg.color,
              boxShadow: `0 0 6px ${cfg.color}`,
            }}/>
            <span style={{ 
              fontSize: '0.6875rem', 
              fontWeight: 700, 
              fontFamily: 'JetBrains Mono, monospace',
              color: cfg.color,
            }}>{count}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

/* Enhanced Alert Item */
const AlertItem = ({ alert, index }) => {
  const cfg = severityConfig[alert.severity] || severityConfig.low;
  const [expanded, setExpanded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="alert-item-enhanced"
      style={{ 
        background: cfg.gradient,
        border: `1px solid ${cfg.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={() => setExpanded(!expanded)}
      whileHover={{ scale: 1.01 }}
    >
      {/* Priority indicator bar */}
      <div style={{ 
        position: 'absolute', 
        left: 0, 
        top: 0, 
        bottom: 0, 
        width: 3, 
        background: cfg.color,
        borderRadius: '3px 0 0 3px',
      }}/>
      
      <div style={{ padding: '14px 14px 14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {/* Icon */}
          <div style={{ 
            width: 36, 
            height: 36, 
            borderRadius: 10, 
            background: `${cfg.color}15`,
            border: `1px solid ${cfg.color}30`,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <AlertIcon severity={alert.severity} />
          </div>
          
          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ 
                fontWeight: 700, 
                fontFamily: 'JetBrains Mono, monospace', 
                fontSize: '0.875rem', 
                color: 'var(--text-primary)',
              }}>
                {alert.panelId}
              </span>
              <span style={{ 
                fontSize: '0.5625rem', 
                fontWeight: 800, 
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '3px 8px',
                borderRadius: 5,
                background: `${cfg.color}20`, 
                color: cfg.color,
                border: `1px solid ${cfg.color}30`,
              }}>
                {cfg.label}
              </span>
            </div>
            
            <p style={{ 
              fontSize: '0.8125rem', 
              color: 'var(--text-secondary)', 
              lineHeight: 1.5,
              marginBottom: 8,
            }}>
              {alert.message}
            </p>
            
            {/* Meta info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ 
                fontSize: '0.6875rem', 
                color: 'var(--text-muted)', 
                fontFamily: 'JetBrains Mono, monospace',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                {timeAgo(alert.timestamp)}
              </span>
              
              {alert.type && (
                <span style={{ 
                  fontSize: '0.625rem', 
                  color: 'var(--text-muted)',
                  padding: '2px 6px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                }}>
                  {alert.type}
                </span>
              )}
            </div>
          </div>
          
          {/* Expand indicator */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            style={{ 
              width: 24, 
              height: 24, 
              borderRadius: 6,
              background: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg style={{ width: 14, height: 14, color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </motion.div>
        </div>
        
        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ 
                marginTop: 14, 
                paddingTop: 14, 
                borderTop: '1px solid var(--border-subtle)',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
              }}>
                <div style={{ 
                  padding: 12, 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                }}>
                  <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Location</p>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Row {alert.row || '-'} • Position {alert.position || '-'}
                  </p>
                </div>
                <div style={{ 
                  padding: 12, 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                }}>
                  <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Recommended</p>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: cfg.color }}>
                    Schedule Inspection
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: cfg.color,
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}>
                  <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  View Panel
                </button>
                <button style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border-default)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}>
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function AlertPanel({ alerts, expanded }) {
  const sorted = (alerts || [])
    .filter(a => !a.resolved)
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
    })
    .slice(0, expanded ? 50 : 8);

  const criticalCount = sorted.filter(a => a.severity === 'critical').length;

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Enhanced Header */}
      <div className="card-header" style={{ paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 12, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1))',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            position: 'relative',
          }}>
            <svg style={{ width: 22, height: 22, color: '#ef4444' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" fill="currentColor" opacity="0.2"/>
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            {criticalCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-card)',
                }}
              >
                {criticalCount}
              </motion.div>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 className="card-title" style={{ margin: 0 }}>Active Alerts</h3>
              <HeliosLogo size={16} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {sorted.length > 0 ? `${sorted.length} alerts requiring attention` : 'All systems nominal'}
            </p>
          </div>
        </div>
        
        {sorted.length > 0 && <SeveritySummary alerts={alerts} />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {sorted.length === 0 ? (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="empty-state-icon" style={{ 
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.08))',
              border: '1px solid rgba(34, 197, 94, 0.2)',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="empty-state-title">All Systems Operational</p>
            <p className="empty-state-desc">No active alerts • Last checked just now</p>
            <div style={{ 
              marginTop: 16,
              padding: '12px 20px',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: 10,
              border: '1px solid rgba(34, 197, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }}/>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#22c55e' }}>
                System Health: Excellent
              </span>
            </div>
          </motion.div>
        ) : (
          <div style={{ 
            padding: '0 16px 16px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 10, 
            overflowY: 'auto', 
            maxHeight: expanded ? 600 : 400,
          }}>
            <AnimatePresence>
              {sorted.map((alert, i) => (
                <AlertItem key={alert.alertId || i} alert={alert} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      {/* Footer Stats */}
      {sorted.length > 0 && (
        <div style={{ 
          padding: '12px 16px', 
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ 
            fontSize: '0.6875rem', 
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
            </svg>
            Auto-refresh every 30s
          </span>
          <button style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border-default)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9v-9m0 0a9 9 0 00-9-9"/>
            </svg>
            View All
          </button>
        </div>
      )}
    </div>
  );
}
