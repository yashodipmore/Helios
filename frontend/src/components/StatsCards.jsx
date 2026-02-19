/* Enterprise Minimal - Stats Cards */

const Icon = ({ type, color }) => {
  const icons = {
    bolt: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    gauge: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>,
    alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  };
  return icons[type] || null;
};

const cards = [
  { key: 'power', label: 'Power Output', getValue: s => (s.totalPowerKw || 0).toFixed(1), unit: 'kW', color: '#f59e0b', iconType: 'bolt' },
  { key: 'efficiency', label: 'Efficiency', getValue: s => (s.avgEfficiency || 0).toFixed(1), unit: '%', color: '#22c55e', iconType: 'gauge' },
  { key: 'panels', label: 'Healthy Panels', getValue: s => s.healthyCount || 0, sub: s => `/ ${s.totalPanels || 0}`, color: '#3b82f6', iconType: 'check' },
  { key: 'alerts', label: 'Active Alerts', getValue: s => (s.warningCount || 0) + (s.criticalCount || 0), color: '#ef4444', iconType: 'alert', extra: s => ({ c: s.criticalCount || 0, w: s.warningCount || 0 }) },
];

export default function StatsCards({ farmStats }) {
  if (!farmStats) return null;

  const cardStyle = { padding: 16, borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 8 };
  const labelStyle = { fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' };
  const valueStyle = { fontSize: 26, fontWeight: 700, fontFamily: 'monospace' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
      {cards.map(c => {
        const val = c.getValue(farmStats);
        const sub = c.sub?.(farmStats);
        const extra = c.extra?.(farmStats);
        return (
          <div key={c.key} style={{ ...cardStyle, borderLeft: `3px solid ${c.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={labelStyle}>{c.label}</span>
              <Icon type={c.iconType} color={c.color} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ ...valueStyle, color: c.color }}>{val}</span>
              {c.unit && <span style={{ fontSize: 13, color: c.color, opacity: 0.7 }}>{c.unit}</span>}
              {sub && <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>{sub}</span>}
            </div>
            {extra && (
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {extra.c > 0 && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: 600 }}>{extra.c} critical</span>}
                {extra.w > 0 && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 600 }}>{extra.w} warning</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
