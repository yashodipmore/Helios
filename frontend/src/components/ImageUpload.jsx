import { useState, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001';

/* Enterprise Minimal - Image Upload / AI Analysis */

export default function ImageUpload({ isOpen = true, onClose, panelId, onAnalysisComplete }) {
  const [selectedType, setSelectedType] = useState('thermal');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const types = {
    thermal: { label: 'Thermal', endpoint: '/api/upload/thermal-image', desc: 'Detect hotspots and temperature anomalies' },
    visual: { label: 'Visual', endpoint: '/api/upload/panel-image', desc: 'Identify physical damage and soiling' },
    el: { label: 'EL Image', endpoint: '/api/upload/el-image', desc: 'Detect micro-cracks via electroluminescence' },
  };

  const handleFile = (file) => {
    if (!file?.type?.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    setSelectedFile(file);
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (panelId) formData.append('panel_id', panelId);
      const res = await fetch(`${API_BASE}${types[selectedType].endpoint}`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
      const data = await res.json();
      setResult(data);
      if (onAnalysisComplete) onAnalysisComplete(data);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => { setSelectedFile(null); setPreview(null); setResult(null); setError(null); };

  // Modal mode check - if isOpen is explicitly false, return null
  if (isOpen === false) return null;

  const isModal = typeof onClose === 'function';
  const btnStyle = { padding: '10px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 };

  const content = (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>AI Image Analysis</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Upload thermal, visual, or EL images for AI-powered diagnostics</p>
      </div>

      {/* Type Selection */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Select Image Type</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {Object.entries(types).map(([key, t]) => (
            <button key={key} onClick={() => { setSelectedType(key); reset(); }} style={{ 
              ...btnStyle, 
              padding: '14px 12px',
              background: selectedType === key ? 'var(--accent-primary)' : 'var(--bg-tertiary)', 
              color: selectedType === key ? '#fff' : 'var(--text-secondary)',
              borderLeft: selectedType === key ? '3px solid #f59e0b' : '3px solid transparent',
              textAlign: 'left'
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <div className="card" style={{ padding: 16 }}>
        {!preview && !result && (
          <div onClick={() => fileInputRef.current?.click()} 
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
            onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-subtle)'; handleFile(e.dataTransfer.files[0]); }}
            style={{ border: '2px dashed var(--border-subtle)', borderRadius: 8, padding: 40, textAlign: 'center', cursor: 'pointer', background: 'var(--bg-tertiary)' }}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: 'none' }} />
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ marginBottom: 12 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>Click to select or drag image here</p>
            <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>Supports: JPG, PNG, TIFF (max 10MB)</p>
          </div>
        )}

        {/* Preview */}
        {preview && !result && (
          <div>
            <div style={{ marginBottom: 12, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Preview</div>
            <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 6, marginBottom: 16, background: '#000', border: '1px solid var(--border-subtle)' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={reset} style={{ ...btnStyle, flex: 1, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={handleUpload} disabled={uploading} style={{ ...btnStyle, flex: 2, background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {uploading ? 'Analyzing...' : 'Run AI Analysis'}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div style={{ marginTop: 12, padding: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#ef4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}

        {/* Result */}
        {result && (
          <div>
            <div style={{ padding: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 6, marginBottom: 16, color: '#22c55e', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>Analysis Complete
            </div>
            
            {/* Summary */}
            {(result.analysis || result.defects_detected !== undefined) && (
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: 6, padding: 14, marginBottom: 16, borderLeft: '3px solid #a78bfa' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', marginBottom: 8 }}>AI Findings</div>
                {result.analysis?.summary && <p style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 8 }}>{result.analysis.summary}</p>}
                {result.defects_detected !== undefined && (
                  <p style={{ fontSize: 13, color: result.defects_detected ? '#ef4444' : '#22c55e', fontWeight: 600 }}>
                    {result.defects_detected ? `${result.defect_count || 'Multiple'} defects detected` : 'No defects detected'}
                  </p>
                )}
                {result.confidence && (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Confidence: {(result.confidence * 100).toFixed(0)}%</p>
                )}
              </div>
            )}

            {/* Raw JSON */}
            <details style={{ marginBottom: 16 }}>
              <summary style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', padding: '8px 0' }}>View Raw Response</summary>
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: 4, padding: 12, fontSize: 11, marginTop: 8 }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </details>

            <button onClick={reset} style={{ ...btnStyle, width: '100%', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              Analyze Another Image
            </button>
          </div>
        )}
      </div>

      {/* AI Models Info */}
      <div className="card" style={{ padding: 14, marginTop: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Powered By</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1, padding: 10, borderRadius: 6, background: 'var(--bg-tertiary)', borderLeft: '3px solid #22c55e' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Google Gemini 1.5</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Vision Analysis</div>
          </div>
          <div style={{ flex: 1, padding: 10, borderRadius: 6, background: 'var(--bg-tertiary)', borderLeft: '3px solid #3b82f6' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Groq LLaMA 3.3</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Root Cause LLM</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal mode
  if (isModal) {
    return (
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-primary)', borderRadius: 10, maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'auto', border: '1px solid var(--border-subtle)', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -10 }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  // Standalone page mode
  return content;
}
