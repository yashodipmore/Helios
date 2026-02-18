import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

/* Premium Animated Icons with Enhanced Design */
const PowerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="powerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.4"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.1"/>
      </linearGradient>
    </defs>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#powerGrad)"/>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EfficiencyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="effGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.05"/>
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="9" fill="url(#effGrad)"/>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const HealthyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.05"/>
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#healthGrad)"/>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AlertsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="alertGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.35"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.1"/>
      </linearGradient>
    </defs>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="url(#alertGrad)"/>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="1.2" fill="currentColor"/>
  </svg>
);

/* Animated Counter Hook */
const useAnimatedCounter = (end, duration = 1500) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime;
    let animationFrame;
    const startValue = 0;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(startValue + (end - startValue) * easeOut);
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return count;
};

/* Mini Sparkline Chart */
const MiniSparkline = ({ color, trend = 'up' }) => {
  const points = trend === 'up' 
    ? "2,18 6,14 10,16 14,10 18,12 22,6"
    : "2,6 6,10 10,8 14,14 18,12 22,18";
  
  return (
    <svg width="60" height="24" viewBox="0 0 24 24" style={{ opacity: 0.6 }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={trend === 'up' ? "22" : "22"} cy={trend === 'up' ? "6" : "18"} r="2" fill={color}/>
    </svg>
  );
};

/* Circular Progress Ring */
const CircularProgress = ({ percent, color, size = 44 }) => {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size/2}
        cy={size/2}
        r={radius}
        fill="none"
        stroke={`${color}20`}
        strokeWidth="3"
      />
      <circle
        cx={size/2}
        cy={size/2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
      />
    </svg>
  );
};

const cardData = [
  {
    key: 'power',
    title: 'Total Power Output',
    subtitle: 'Real-time generation',
    icon: PowerIcon,
    getValue: (s) => (s.totalPowerKw || 0).toFixed(1),
    unit: 'kW',
    trend: 'up',
    change: '+12.3%',
    accentColor: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.02) 100%)',
  },
  {
    key: 'efficiency',
    title: 'System Efficiency',
    subtitle: 'Performance metric',
    icon: EfficiencyIcon,
    getValue: (s) => (s.avgEfficiency || 0).toFixed(1),
    unit: '%',
    trend: 'up',
    change: '+2.1%',
    accentColor: '#22c55e',
    gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.02) 100%)',
    showProgress: true,
  },
  {
    key: 'healthy',
    title: 'Operational Panels',
    subtitle: 'IEC 62446-3 compliant',
    icon: HealthyIcon,
    getValue: (s) => s.healthyCount || 0,
    subValue: (s) => `of ${s.totalPanels || 0} panels`,
    percentValue: (s) => ((s.healthyCount || 0) / (s.totalPanels || 1) * 100).toFixed(1),
    unit: '',
    trend: 'up',
    change: '+3 panels',
    accentColor: '#3b82f6',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.02) 100%)',
    showProgress: true,
  },
  {
    key: 'alerts',
    title: 'Active Alerts',
    subtitle: 'Requires attention',
    icon: AlertsIcon,
    getValue: (s) => (s.warningCount || 0) + (s.criticalCount || 0),
    breakdown: (s) => ({ warning: s.warningCount || 0, critical: s.criticalCount || 0 }),
    unit: '',
    trend: 'down',
    change: '-2 resolved',
    accentColor: '#ef4444',
    gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.02) 100%)',
  },
];

export default function StatsCards({ farmStats }) {
  if (!farmStats) return null;

  return (
    <div className="metric-grid" style={{ gap: 20 }}>
      {cardData.map((card, i) => {
        const Icon = card.icon;
        const value = card.getValue(farmStats);
        const numericValue = parseFloat(value) || 0;
        const sub = card.subValue?.(farmStats);
        const percentValue = card.percentValue?.(farmStats);
        const breakdown = card.breakdown?.(farmStats);

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
            className="stat-card"
            style={{
              background: card.gradient,
              borderRadius: 20,
              padding: '20px 24px',
              position: 'relative',
              overflow: 'hidden',
              border: `1px solid ${card.accentColor}20`,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            whileHover={{ 
              y: -4, 
              boxShadow: `0 20px 40px ${card.accentColor}15, 0 0 0 1px ${card.accentColor}30`,
              transition: { duration: 0.2 }
            }}
          >
            {/* Top Accent Line */}
            <div 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 20, 
                right: 20, 
                height: 3, 
                background: `linear-gradient(90deg, ${card.accentColor}, ${card.accentColor}60)`,
                borderRadius: '0 0 4px 4px',
              }} 
            />

            {/* Background glow */}
            <div style={{
              position: 'absolute',
              right: -30,
              top: -30,
              width: 120,
              height: 120,
              background: `radial-gradient(circle, ${card.accentColor}10 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}/>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <span style={{ 
                  fontSize: '0.8125rem', 
                  fontWeight: 600, 
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: 2,
                }}>
                  {card.title}
                </span>
                <span style={{ 
                  fontSize: '0.6875rem', 
                  color: 'var(--text-muted)',
                  display: 'block',
                }}>
                  {card.subtitle}
                </span>
              </div>
              <motion.div 
                style={{ 
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: `${card.accentColor}15`,
                  border: `1px solid ${card.accentColor}25`,
                  color: card.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)',
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <div style={{ width: 22, height: 22 }}>
                  <Icon />
                </div>
              </motion.div>
            </div>

            {/* Main Value with Animation */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12 }}>
              <span 
                style={{ 
                  fontSize: '2.25rem', 
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  color: card.accentColor,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                {typeof value === 'number' ? value.toFixed(1) : value}
              </span>
              {card.unit && (
                <span style={{ 
                  fontSize: '1rem', 
                  fontWeight: 600,
                  color: card.accentColor,
                  opacity: 0.7,
                  marginBottom: 4,
                }}>
                  {card.unit}
                </span>
              )}
              
              {/* Progress Ring for specific cards */}
              {card.showProgress && percentValue && (
                <div style={{ marginLeft: 'auto', position: 'relative' }}>
                  <CircularProgress percent={parseFloat(percentValue)} color={card.accentColor} />
                  <span style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(90deg)',
                    fontSize: '0.625rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    color: card.accentColor,
                  }}>
                    {Math.round(parseFloat(percentValue))}%
                  </span>
                </div>
              )}
            </div>

            {/* Breakdown for Alerts */}
            {breakdown && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6,
                  padding: '6px 10px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  borderRadius: 8,
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: breakdown.critical > 0 ? 'pulse 1s infinite' : 'none' }}/>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>{breakdown.critical}</span>
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>critical</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6,
                  padding: '6px 10px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  borderRadius: 8,
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}/>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>{breakdown.warning}</span>
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>warning</span>
                </div>
              </div>
            )}

            {/* Subvalue */}
            {sub && (
              <p style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-muted)',
                marginBottom: 8,
              }}>
                {sub}
              </p>
            )}

            {/* Footer with Trend */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginTop: 8,
              paddingTop: 12,
              borderTop: `1px solid ${card.accentColor}15`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ 
                  fontSize: '0.6875rem', 
                  fontWeight: 600,
                  color: card.trend === 'up' ? '#22c55e' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    {card.trend === 'up' ? (
                      <path d="M6 2L10 6H7V10H5V6H2L6 2Z" fill="currentColor"/>
                    ) : (
                      <path d="M6 10L2 6H5V2H7V6H10L6 10Z" fill="currentColor"/>
                    )}
                  </svg>
                  {card.change}
                </span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>vs last hour</span>
              </div>
              <MiniSparkline color={card.accentColor} trend={card.trend} />
            </div>

            {/* Pulse animation for critical alerts */}
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.2); }
              }
            `}</style>
          </motion.div>
        );
      })}
    </div>
  );
}
