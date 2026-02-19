/* Enterprise Minimal - Status Breakdown */

export default function StatusBreakdown({ farmStats }) {
  if (!farmStats?.totalPanels) return null;

  const total = farmStats.totalPanels;
  const segments = [
    { label: 'Operational', count: farmStats.healthyCount || 0, color: '#22c55e' },
    { label: 'Degraded', count: farmStats.warningCount || 0, color: '#f59e0b' },
    { label: 'Critical', count: farmStats.criticalCount || 0, color: '#ef4444' },
  ].map(s => ({ ...s, pct: ((s.count / total) * 100).toFixed(1) }));

  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>System Health</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{total} panels</span>
      </div>

      {/* Bar */}
      <div style={{ height: 8, borderRadius: 4, background: 'var(--border-subtle)', display: 'flex', marginBottom: 12, overflow: 'hidden' }}>
        {segments.map(s => s.count > 0 && <div key={s.label} style={{ height: '100%', width: `${s.pct}%`, background: s.color }} />)}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12 }}>
        {segments.map(s => (
          <div key={s.label} style={{ flex: 1, padding: 10, borderRadius: 6, background: `${s.color}10`, borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: s.color }}>{s.count}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
