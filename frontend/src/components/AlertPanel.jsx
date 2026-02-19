import { useState } from 'react';

/* Enterprise Minimal - Alert Panel */

const severityColors = {
  critical: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
  high: { bg: 'rgba(249,115,22,0.1)', color: '#f97316', border: 'rgba(249,115,22,0.25)' },
  medium: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
  low: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.25)' },
};

const timeAgo = (ts) => {
  if (!ts) return '';
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function AlertPanel({ alerts, expanded }) {
  const sorted = (alerts || [])
    .filter(a => !a.resolved)
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
    })
    .slice(0, expanded ? 50 : 10);

  const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
  const thStyle = { padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid var(--border-subtle)' };
  const tdStyle = { padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' };

  if (sorted.length === 0) {
    return (
      <div className="card" style={{ padding: 30, textAlign: 'center' }}>
        <div style={{ marginBottom: 12, color: '#22c55e', fontSize: 24 }}>✓</div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>All Systems Operational</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>No active alerts</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {sorted.filter(a => a.severity === 'critical').length}
            </span>
          </div>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Active Alerts</span>
            <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>{sorted.length} alerts requiring attention</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {Object.entries(severityColors).map(([k, v]) => {
            const count = sorted.filter(a => a.severity === k).length;
            if (!count) return null;
            return <span key={k} style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: v.bg, color: v.color, border: `1px solid ${v.border}` }}>{count}</span>;
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Panel</th>
              <th style={thStyle}>Issue</th>
              <th style={thStyle}>Severity</th>
              <th style={thStyle}>Time</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((alert, i) => {
              const cfg = severityColors[alert.severity] || severityColors.low;
              return (
                <tr key={alert.alertId || i} style={{ borderLeft: `3px solid ${cfg.color}` }}>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 600 }}>{alert.panelId}</td>
                  <td style={{ ...tdStyle, maxWidth: 300 }}>
                    <span style={{ display: 'block', color: 'var(--text-primary)', fontSize: 13 }}>{alert.message}</span>
                    {alert.type && <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{alert.type}</span>}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700, background: cfg.bg, color: cfg.color, textTransform: 'uppercase' }}>
                      {alert.severity}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: 11, whiteSpace: 'nowrap' }}>{timeAgo(alert.timestamp)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
