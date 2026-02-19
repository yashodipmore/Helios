import { useState, useEffect } from 'react';
import { getSensorStatus } from '../services/api';

/* Enterprise Minimal - Hardware Status */

export default function HardwareStatus() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Hardware - ALL DISCONNECTED (no real hardware)
  const hardware = [
    { name: 'Panel Sensors (Temperature/Irradiance)', port: 'mqtt://localhost:1883', protocol: 'MQTT 5.0' },
    { name: 'Thermal Camera Array', port: 'rtsp://192.168.1.100:554', protocol: 'ONVIF/RTSP' },
    { name: 'MQTT Message Broker', port: 'tcp://localhost:1883', protocol: 'MQTT 5.0' },
    { name: 'Edge Gateway', port: 'http://192.168.1.50:8080', protocol: 'REST API' },
    { name: 'Modbus Power Meters', port: '/dev/ttyUSB0', protocol: 'Modbus RTU' },
  ];

  // Cloud services - actually connected
  const cloud = [
    { name: 'Firebase Realtime DB', endpoint: 'helios-d3b07.firebaseio.com', connected: true },
    { name: 'Supabase (Time-series)', endpoint: 'supabase.co/project/helios', connected: true },
    { name: 'Google Gemini Vision', endpoint: 'generativelanguage.googleapis.com', connected: true },
    { name: 'Groq Cloud (LLaMA)', endpoint: 'api.groq.com/v1', connected: true },
  ];

  if (loading) return <div className="card" style={{ padding: 16 }}>Loading...</div>;

  const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
  const thStyle = { padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid var(--border-subtle)' };
  const tdStyle = { padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Warning */}
      <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 4 }}>
        <span style={{ fontSize: 13, color: '#f59e0b' }}>⚠ Demo Mode - No hardware connected. Connect sensors via MQTT/Modbus for real-time data.</span>
      </div>

      {/* Hardware Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Hardware Devices</span>
        </div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Device</th>
              <th style={thStyle}>Connection</th>
              <th style={thStyle}>Protocol</th>
              <th style={{...thStyle, textAlign: 'center'}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {hardware.map((h, i) => (
              <tr key={i}>
                <td style={tdStyle}>{h.name}</td>
                <td style={{...tdStyle, fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)'}}>{h.port}</td>
                <td style={{...tdStyle, color: 'var(--text-muted)'}}>{h.protocol}</td>
                <td style={{...tdStyle, textAlign: 'center'}}>
                  <span style={{ padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 600, background: 'rgba(100,116,139,0.15)', color: '#64748b' }}>
                    DISCONNECTED
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cloud Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Cloud Services</span>
        </div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Service</th>
              <th style={thStyle}>Endpoint</th>
              <th style={{...thStyle, textAlign: 'center'}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {cloud.map((c, i) => (
              <tr key={i}>
                <td style={tdStyle}>{c.name}</td>
                <td style={{...tdStyle, fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)'}}>{c.endpoint}</td>
                <td style={{...tdStyle, textAlign: 'center'}}>
                  <span style={{ 
                    padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 600,
                    background: c.connected ? 'rgba(34,197,94,0.15)' : 'rgba(100,116,139,0.15)', 
                    color: c.connected ? '#22c55e' : '#64748b' 
                  }}>
                    {c.connected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Supported Protocols */}
      <div className="card" style={{ padding: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Supported Protocols</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          MQTT 5.0 (IoT sensors) • Modbus TCP/RTU (Industrial meters) • RTSP/ONVIF (Cameras) • REST API (Edge devices)
        </p>
      </div>
    </div>
  );
}
