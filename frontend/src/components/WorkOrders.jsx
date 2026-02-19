import { useState, useEffect } from 'react';
import { getWorkOrders, createWorkOrder, completeWorkOrder, cancelWorkOrder } from '../services/api';

/* Enterprise Minimal - Work Orders */

export default function WorkOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ panel_id: '', issue_type: 'hotspot', priority: 'medium', description: '' });

  const fetchOrders = async () => {
    try {
      const res = await getWorkOrders();
      setOrders(res?.data?.work_orders || res?.work_orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await createWorkOrder(form);
      console.log('Work order created:', res?.data || res);
      setForm({ panel_id: '', issue_type: 'hotspot', priority: 'medium', description: '' });
      setShowForm(false);
      await fetchOrders();
    } catch (err) {
      console.error('Failed to create work order:', err);
      alert('Failed to create work order: ' + (err?.response?.data?.detail || err.message));
    }
  };

  const handleComplete = async (id) => {
    try { await completeWorkOrder(id); fetchOrders(); } catch (err) { console.error(err); }
  };

  const handleCancel = async (id) => {
    try { await cancelWorkOrder(id); fetchOrders(); } catch (err) { console.error(err); }
  };

  const priorityStyle = (p) => ({
    padding: '2px 6px', borderRadius: 3, fontSize: 11, fontWeight: 600,
    background: p === 'critical' ? 'rgba(239,68,68,0.15)' : p === 'high' ? 'rgba(249,115,22,0.15)' : p === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
    color: p === 'critical' ? '#ef4444' : p === 'high' ? '#f97316' : p === 'medium' ? '#f59e0b' : '#22c55e'
  });

  const statusStyle = (s) => ({
    padding: '2px 6px', borderRadius: 3, fontSize: 11, fontWeight: 600,
    background: s === 'completed' ? 'rgba(34,197,94,0.15)' : s === 'in_progress' ? 'rgba(59,130,246,0.15)' : s === 'cancelled' ? 'rgba(239,68,68,0.15)' : 'rgba(100,116,139,0.15)',
    color: s === 'completed' ? '#22c55e' : s === 'in_progress' ? '#3b82f6' : s === 'cancelled' ? '#ef4444' : '#64748b'
  });

  const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
  const thStyle = { padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid var(--border-subtle)' };
  const tdStyle = { padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' };

  if (loading) return <div className="card" style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{orders.length} work orders</span>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>
          {showForm ? 'Cancel' : '+ New Order'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card" style={{ padding: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 10 }}>
            <input value={form.panel_id} onChange={(e) => setForm({ ...form, panel_id: e.target.value })} placeholder="Panel ID" required style={{ padding: 8, borderRadius: 4, border: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: 12 }} />
            <select value={form.issue_type} onChange={(e) => setForm({ ...form, issue_type: e.target.value })} style={{ padding: 8, borderRadius: 4, border: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: 12 }}>
              <option value="hotspot">Hotspot</option>
              <option value="crack">Crack</option>
              <option value="soiling">Soiling</option>
              <option value="degradation">Degradation</option>
            </select>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={{ padding: 8, borderRadius: 4, border: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: 12 }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px', fontSize: 12 }}>Create</button>
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" rows={2} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: 12, resize: 'vertical' }} />
        </form>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {orders.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No work orders. Create one to get started.</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Panel</th>
                <th style={thStyle}>Issue</th>
                <th style={thStyle}>Priority</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Created</th>
                <th style={{...thStyle, textAlign: 'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{...tdStyle, fontFamily: 'monospace', fontSize: 11}}>#{o.id?.slice(0, 8)}</td>
                  <td style={tdStyle}>{o.panel_id}</td>
                  <td style={tdStyle}>{o.issue_type?.replace('_', ' ')}</td>
                  <td style={tdStyle}><span style={priorityStyle(o.priority)}>{o.priority?.toUpperCase()}</span></td>
                  <td style={tdStyle}><span style={statusStyle(o.status)}>{o.status?.replace('_', ' ')}</span></td>
                  <td style={{...tdStyle, color: 'var(--text-muted)', fontSize: 11}}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td style={{...tdStyle, textAlign: 'center'}}>
                    {o.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button onClick={() => handleComplete(o.id)} style={{ padding: '3px 8px', borderRadius: 3, border: 'none', background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: 11, cursor: 'pointer' }}>Complete</button>
                        <button onClick={() => handleCancel(o.id)} style={{ padding: '3px 8px', borderRadius: 3, border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    )}
                    {o.status !== 'pending' && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
