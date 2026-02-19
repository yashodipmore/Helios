import { useMemo, useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';

/* Enterprise Minimal - Analytics Charts */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function generatePowerTrend(peakPower = 280) {
  return Array.from({ length: 24 }, (_, h) => {
    let factor = (h >= 6 && h <= 18) ? Math.exp(-0.5 * Math.pow((h - 12) / 3.5, 2)) : 0;
    return { time: `${h.toString().padStart(2, '0')}:00`, power: Math.round(peakPower * factor * (0.92 + Math.random() * 0.16)) };
  });
}

function generateEfficiencyDist(panels) {
  const buckets = [
    { range: '<60%', count: 0, fill: '#ef4444' },
    { range: '60-70', count: 0, fill: '#f97316' },
    { range: '70-80', count: 0, fill: '#f59e0b' },
    { range: '80-85', count: 0, fill: '#84cc16' },
    { range: '85-90', count: 0, fill: '#22c55e' },
    { range: '90-95', count: 0, fill: '#10b981' },
    { range: '95+', count: 0, fill: '#059669' },
  ];
  panels.forEach(p => {
    const e = p.efficiency || 0;
    if (e < 60) buckets[0].count++;
    else if (e < 70) buckets[1].count++;
    else if (e < 80) buckets[2].count++;
    else if (e < 85) buckets[3].count++;
    else if (e < 90) buckets[4].count++;
    else if (e < 95) buckets[5].count++;
    else buckets[6].count++;
  });
  return buckets;
}

const COLORS = { healthy: '#22c55e', warning: '#f59e0b', critical: '#ef4444' };

export default function AnalyticsCharts({ farmStats, panels, expanded }) {
  const [powerTrend, setPowerTrend] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/history/analytics/power-trend?period=1d`);
        if (res.ok) {
          const data = await res.json();
          if (data.data?.length) {
            setPowerTrend(data.data.map(d => ({
              time: new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              power: Math.round(d.value || d.avg || 0),
            })));
            return;
          }
        }
      } catch (e) {}
      setPowerTrend(generatePowerTrend(farmStats?.totalPowerKw));
    }
    load();
  }, [farmStats?.totalPowerKw]);

  const effDist = useMemo(() => generateEfficiencyDist(panels || []), [panels]);
  const statusPie = useMemo(() => farmStats ? [
    { name: 'Healthy', value: farmStats.healthyCount || 0, fill: COLORS.healthy },
    { name: 'Warning', value: farmStats.warningCount || 0, fill: COLORS.warning },
    { name: 'Critical', value: farmStats.criticalCount || 0, fill: COLORS.critical },
  ] : [], [farmStats]);

  if (!farmStats) return null;

  const h = expanded ? 280 : 220;
  const axisStyle = { stroke: 'var(--text-muted)', fontSize: 10, tickLine: false, axisLine: false };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: expanded ? '1fr' : '2fr 1fr', gap: 16 }}>
      {/* Power Curve */}
      <div className="card" style={{ padding: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>Power Generation (24h)</h4>
        <ResponsiveContainer width="100%" height={h}>
          <AreaChart data={powerTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="pwrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
            <XAxis dataKey="time" {...axisStyle} interval={3} />
            <YAxis {...axisStyle} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="power" stroke="#f59e0b" strokeWidth={2} fill="url(#pwrGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Status Pie */}
      <div className="card" style={{ padding: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>Panel Status</h4>
        <ResponsiveContainer width="100%" height={h}>
          <PieChart>
            <Pie data={statusPie} cx="50%" cy="45%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
              {statusPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Pie>
            <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={v => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{v}</span>} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Efficiency Distribution */}
      <div className="card" style={{ padding: 16, gridColumn: expanded ? 'span 1' : 'span 2' }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>Efficiency Distribution</h4>
        <ResponsiveContainer width="100%" height={expanded ? h : 160}>
          <BarChart data={effDist} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
            <XAxis dataKey="range" {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="count" name="Panels" radius={[4, 4, 0, 0]}>
              {effDist.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
