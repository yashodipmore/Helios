export default function StatusBreakdown({ farmStats }) {
  if (!farmStats || !farmStats.totalPanels) return null;

  const total = farmStats.totalPanels;
  const healthy = farmStats.healthyCount || 0;
  const warning = farmStats.warningCount || 0;
  const critical = farmStats.criticalCount || 0;

  const healthyPct = ((healthy / total) * 100).toFixed(1);
  const warningPct = ((warning / total) * 100).toFixed(1);
  const criticalPct = ((critical / total) * 100).toFixed(1);

  const segments = [
    { label: 'Operational', count: healthy, pct: healthyPct, color: '#22c55e' },
    { label: 'Degraded', count: warning, pct: warningPct, color: '#f59e0b' },
    { label: 'Critical', count: critical, pct: criticalPct, color: '#ef4444' },
  ];

  return (
    <div
      className="card"
      style={{ padding: 20 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.15))' }}>
            <svg style={{ width: 20, height: 20, color: '#3b82f6' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20V10M18 20V4M6 20v-4" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h3 className="card-title">System Health Overview</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time panel status distribution</p>
          </div>
        </div>
        <span style={{ fontSize: '0.875rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>{total.toLocaleString()} panels</span>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar" style={{ marginBottom: 20 }}>
        <div style={{ height: '100%', display: 'flex' }}>
          {segments.map((seg, i) =>
            seg.count > 0 ? (
              <div
                key={seg.label}
                style={{ 
                  height: '100%', 
                  width: `${seg.pct}%`,
                  background: seg.color,
                  borderRadius: i === 0 ? '4px 0 0 4px' : i === segments.length - 1 ? '0 4px 4px 0' : 0,
                  transition: 'width 0.3s ease'
                }}
              />
            ) : null
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {segments.map((seg) => (
          <div 
            key={seg.label} 
            style={{ 
              padding: 16, 
              borderRadius: 12, 
              border: '1px solid var(--border-subtle)',
              background: `${seg.color}08` 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: seg.color }}/>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{seg.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: seg.color }}>{seg.count}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{seg.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
