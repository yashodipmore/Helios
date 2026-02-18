import { useMemo, useState, useCallback, memo } from 'react';

/* ═══════════════════════════════════════════════════════════════
   HELIOS AI - OPTIMIZED Solar Panel Array Visualization
   High-Performance Version - No lag, no hanging
   ═══════════════════════════════════════════════════════════════ */

// CSS classes for status - no inline styles recalculation
const statusClasses = {
  healthy: 'panel-healthy',
  warning: 'panel-warning', 
  critical: 'panel-critical',
};

/* Optimized Solar Panel - Memoized for performance */
const SolarPanel = memo(function SolarPanel({ panel, onClick, isSelected }) {
  const statusColor = {
    healthy: '#22c55e',
    warning: '#f59e0b',
    critical: '#ef4444',
  }[panel.status] || '#22c55e';

  return (
    <div
      onClick={onClick}
      className={`solar-panel-optimized ${statusClasses[panel.status] || ''} ${isSelected ? 'selected' : ''}`}
      data-status={panel.status}
      title={`${panel.id} - ${panel.power}W`}
    >
      {/* Simple panel visual */}
      <div className="panel-inner">
        {/* Grid lines - pure CSS */}
        <div className="panel-grid-lines" />
        
        {/* Status LED */}
        <div 
          className="panel-led"
          style={{ backgroundColor: statusColor }}
        />
      </div>
    </div>
  );
}, (prev, next) => {
  // Only re-render if these props change
  return prev.panel.id === next.panel.id && 
         prev.panel.status === next.panel.status &&
         prev.panel.power === next.panel.power &&
         prev.isSelected === next.isSelected;
});

/* Status Badge */
function SystemStatusBadge({ status }) {
  const config = {
    online: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', label: 'ONLINE' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', label: 'WARNING' },
    critical: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: 'CRITICAL' },
  }[status] || { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', label: 'ONLINE' };

  return (
    <div className="system-status-badge" style={{ background: config.bg, color: config.color }}>
      <span className="status-dot" style={{ backgroundColor: config.color }} />
      {config.label}
    </div>
  );
}

export default function PanelGrid({ panels, onPanelClick, fullscreen }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedPanelId, setSelectedPanelId] = useState(null);

  // Memoized filtered panels
  const filtered = useMemo(() => {
    if (!panels || panels.length === 0) return [];
    let result = panels;
    if (filter !== 'all') {
      result = result.filter((p) => p.status === filter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) => (p.id || '').toLowerCase().includes(q));
    }
    return result;
  }, [panels, filter, search]);

  // Memoized counts
  const counts = useMemo(() => {
    if (!panels) return { all: 0, healthy: 0, warning: 0, critical: 0 };
    return {
      all: panels.length,
      healthy: panels.filter((p) => p.status === 'healthy').length,
      warning: panels.filter((p) => p.status === 'warning').length,
      critical: panels.filter((p) => p.status === 'critical').length,
    };
  }, [panels]);

  // Memoized farm stats
  const farmStats = useMemo(() => {
    if (!panels || panels.length === 0) return null;
    const totalPower = panels.reduce((sum, p) => sum + (p.power || 0), 0);
    const avgEfficiency = panels.reduce((sum, p) => sum + (p.efficiency || 0), 0) / panels.length;
    const healthRate = (counts.healthy / panels.length * 100);
    return { totalPower, avgEfficiency, healthRate };
  }, [panels, counts.healthy]);

  // Memoized system status
  const systemStatus = useMemo(() => {
    if (counts.critical > 0) return 'critical';
    if (counts.warning > 5) return 'warning';
    return 'online';
  }, [counts.critical, counts.warning]);

  // Memoized click handler
  const handlePanelClick = useCallback((panel) => {
    setSelectedPanelId(panel.id);
    onPanelClick(panel);
  }, [onPanelClick]);

  // Loading state
  if (!panels || panels.length === 0) {
    return (
      <div className="card panel-grid-loading">
        <div className="loading-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="4" width="20" height="14" rx="2"/>
            <line x1="2" y1="11" x2="22" y2="11"/>
            <line x1="8" y1="4" x2="8" y2="18"/>
            <line x1="16" y1="4" x2="16" y2="18"/>
          </svg>
        </div>
        <p className="loading-text">Initializing Panel Array...</p>
        <p className="loading-subtext">Connecting to monitoring system</p>
      </div>
    );
  }

  const filterButtons = [
    { key: 'all', label: 'All', color: '#64748B' },
    { key: 'healthy', label: 'Healthy', color: '#22c55e' },
    { key: 'warning', label: 'Warning', color: '#f59e0b' },
    { key: 'critical', label: 'Critical', color: '#ef4444' },
  ];

  return (
    <div className="card panel-grid-container">
      {/* Header */}
      <div className="panel-grid-header">
        <div className="header-left">
          <div className="helios-icon">
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="14" fill="white" />
              <circle cx="20" cy="21" r="6" fill="#FFB800" />
            </svg>
          </div>
          <div>
            <h3 className="card-title">Solar Panel Array</h3>
            <div className="header-meta">
              <span>{panels.length} panels</span>
              <SystemStatusBadge status={systemStatus} />
            </div>
          </div>
        </div>

        {farmStats && (
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-label">Output</span>
              <span className="stat-value" style={{ color: '#f59e0b' }}>
                {(farmStats.totalPower / 1000).toFixed(1)} kW
              </span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-label">Efficiency</span>
              <span className="stat-value" style={{ color: '#22c55e' }}>
                {farmStats.avgEfficiency.toFixed(1)}%
              </span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-label">Health</span>
              <span className="stat-value" style={{ color: farmStats.healthRate > 90 ? '#22c55e' : '#f59e0b' }}>
                {farmStats.healthRate.toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="panel-grid-filters">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search panel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`filter-btn ${filter === btn.key ? 'active' : ''}`}
              style={filter === btn.key ? { 
                backgroundColor: btn.color, 
                borderColor: btn.color,
              } : {}}
            >
              {btn.label}
              <span className="count">{counts[btn.key]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Panel Grid - Optimized */}
      <div className="panel-grid-body" style={{ minHeight: fullscreen ? 'calc(100vh - 380px)' : 400 }}>
        <div className="panel-grid">
          {filtered.map((panel) => (
            <SolarPanel
              key={panel.id}
              panel={panel}
              onClick={() => handlePanelClick(panel)}
              isSelected={selectedPanelId === panel.id}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="panel-grid-legend">
        {[
          { label: 'Healthy', color: '#22c55e', count: counts.healthy },
          { label: 'Warning', color: '#f59e0b', count: counts.warning },
          { label: 'Critical', color: '#ef4444', count: counts.critical },
        ].map((item) => (
          <div key={item.label} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: item.color }} />
            <span className="legend-label">{item.label}</span>
            <span className="legend-count" style={{ color: item.color }}>{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
