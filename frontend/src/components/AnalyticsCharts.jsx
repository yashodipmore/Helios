import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';

function generatePowerTrend(totalPowerKw) {
  const hours = [];
  const peakPower = totalPowerKw || 280;
  for (let h = 0; h < 24; h++) {
    let factor = 0;
    if (h >= 6 && h <= 18) {
      const mid = 12;
      const spread = 3.5;
      factor = Math.exp(-0.5 * Math.pow((h - mid) / spread, 2));
    }
    const power = Math.round(peakPower * factor * (0.92 + Math.random() * 0.16));
    hours.push({
      time: `${h.toString().padStart(2, '0')}:00`,
      power,
    });
  }
  return hours;
}

function generateEfficiencyDistribution(panels) {
  const buckets = [
    { range: '<60%', count: 0, fill: '#ef4444' },
    { range: '60-70', count: 0, fill: '#f97316' },
    { range: '70-80', count: 0, fill: '#f59e0b' },
    { range: '80-85', count: 0, fill: '#84cc16' },
    { range: '85-90', count: 0, fill: '#22c55e' },
    { range: '90-95', count: 0, fill: '#10b981' },
    { range: '95+', count: 0, fill: '#059669' },
  ];
  panels.forEach((p) => {
    const eff = p.efficiency || 0;
    if (eff < 60) buckets[0].count++;
    else if (eff < 70) buckets[1].count++;
    else if (eff < 80) buckets[2].count++;
    else if (eff < 85) buckets[3].count++;
    else if (eff < 90) buckets[4].count++;
    else if (eff < 95) buckets[5].count++;
    else buckets[6].count++;
  });
  return buckets;
}

const COLORS = { healthy: '#22c55e', warning: '#f59e0b', critical: '#ef4444' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 12,
      padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, fontSize: 13, fontWeight: 600 }}>
          {entry.name}: <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{entry.value} {entry.name === 'Power' ? 'kW' : ''}</span>
        </p>
      ))}
    </div>
  );
};

function ChartCard({ title, subtitle, children, span = 12 }) {
  return (
    <div
      className="card"
      style={{ gridColumn: `span ${span}` }}
    >
      <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <h3 className="card-title">{title}</h3>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

export default function AnalyticsCharts({ farmStats, panels, expanded }) {
  const powerTrend = useMemo(() => generatePowerTrend(farmStats?.totalPowerKw), [farmStats?.totalPowerKw]);
  const efficiencyDist = useMemo(() => generateEfficiencyDistribution(panels || []), [panels]);

  const statusPie = useMemo(() => {
    if (!farmStats) return [];
    return [
      { name: 'Healthy', value: farmStats.healthyCount || 0, fill: COLORS.healthy },
      { name: 'Warning', value: farmStats.warningCount || 0, fill: COLORS.warning },
      { name: 'Critical', value: farmStats.criticalCount || 0, fill: COLORS.critical },
    ];
  }, [farmStats]);

  if (!farmStats) return null;

  const chartHeight = expanded ? 320 : 260;

  return (
    <div className="grid grid-cols-12">
      {/* Power Generation Chart */}
      <ChartCard 
        title="Power Generation Curve" 
        subtitle="24-hour power output trend"
        span={expanded ? 12 : 8}
      >
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart data={powerTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="var(--text-muted)" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              interval={3}
              fontFamily="JetBrains Mono, monospace"
            />
            <YAxis 
              stroke="var(--text-muted)" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              fontFamily="JetBrains Mono, monospace"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="power" 
              stroke="#f59e0b" 
              strokeWidth={2.5} 
              fill="url(#powerGradient)" 
              name="Power"
              dot={false}
              activeDot={{ r: 6, fill: '#f59e0b', stroke: '#1F2937', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Panel Status Pie */}
      <ChartCard 
        title="Panel Distribution" 
        subtitle="Status breakdown"
        span={expanded ? 6 : 4}
      >
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie 
              data={statusPie} 
              cx="50%" 
              cy="45%" 
              innerRadius={55} 
              outerRadius={80} 
              paddingAngle={3} 
              dataKey="value" 
              stroke="none"
            >
              {statusPie.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ color: 'var(--text-secondary)', fontSize: 12, marginLeft: 4 }}>{value}</span>
              )}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 12,
                fontSize: 12,
                color: 'var(--text-primary)',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Efficiency Distribution */}
      <ChartCard 
        title="Efficiency Distribution" 
        subtitle="Panel performance histogram"
        span={expanded ? 6 : 12}
      >
        <ResponsiveContainer width="100%" height={expanded ? chartHeight : 180}>
          <BarChart data={efficiencyDist} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
            <XAxis 
              dataKey="range" 
              stroke="var(--text-muted)" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              fontFamily="JetBrains Mono, monospace"
            />
            <YAxis 
              stroke="var(--text-muted)" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              fontFamily="JetBrains Mono, monospace"
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 12,
                fontSize: 12,
                color: 'var(--text-primary)',
              }}
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
            />
            <Bar dataKey="count" name="Panels" radius={[4, 4, 0, 0]}>
              {efficiencyDist.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
