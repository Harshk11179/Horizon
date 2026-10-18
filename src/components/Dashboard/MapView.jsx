/**
 * MapView.jsx — Full-screen Citizen + Professional map view
 * Uses react-leaflet IndiaMap with real scores from calculation.py
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import IndiaMap from './IndiaMap';
import { latestStateScores, pressureColour, riskBand } from '@hooks/useStateScores';

const STATES = ['All States', ...latestStateScores.map((s) => s.state_name)];

export default function MapView() {
  const [search, setSearch]   = useState('');
  const [viewMode, setViewMode] = useState('citizen'); // 'citizen' | 'professional'
  const [factor, setFactor]   = useState('overall');

  const filtered = latestStateScores.filter((s) =>
    s.state_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex h-[calc(100vh-64px)] w-full overflow-hidden"
      style={{ background: '#f0f4f8' }}
    >
      {/* ── Left Sidebar ── */}
      <div style={{
        width: 280, background: '#fff', borderRight: '1px solid #e5e7eb',
        display: 'flex', flexDirection: 'column', gap: 0,
        boxShadow: '4px 0 20px rgba(0,0,0,0.04)', zIndex: 10,
      }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
            🗺 India Environmental Map
          </div>
          {/* View toggle */}
          <div style={{
            display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 3, marginBottom: 10,
          }}>
            {['citizen', 'professional'].map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                style={{
                  flex: 1, padding: '5px 0', borderRadius: 6, border: 'none',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: viewMode === v ? (v === 'citizen' ? '#10B981' : '#3B82F6') : 'transparent',
                  color: viewMode === v ? '#fff' : '#6b7280',
                  transition: 'all .2s',
                }}
              >
                {v === 'citizen' ? 'Citizen' : 'Professional'}
              </button>
            ))}
          </div>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search state…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '8px 8px 8px 32px',
                border: '1px solid #e5e7eb', borderRadius: 8,
                fontSize: 12, outline: 'none', boxSizing: 'border-box',
                background: '#f9fafb',
              }}
            />
            <span style={{ position: 'absolute', left: 9, top: 8, fontSize: 14, color: '#9ca3af' }}>🔍</span>
          </div>
        </div>

        {/* State list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {filtered.map((s) => {
            const score = viewMode === 'professional' ? s.overall_score : s.overall_score;
            const colour = pressureColour(score);
            return (
              <div key={s.state_code} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', cursor: 'default',
                borderBottom: '1px solid #f9fafb',
                transition: 'background .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: colour, flexShrink: 0,
                  boxShadow: `0 0 6px ${colour}88`,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.state_name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{s.top_pressure_dimensions}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: colour }}>
                    {score != null ? score.toFixed(0) : '—'}
                  </div>
                  <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {riskBand(score)}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
              No states match your search
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', fontSize: 10, color: '#9ca3af' }}>
          Data: CPCB Stations · CGWB 798 Wells · FSI 36-Districts · Horizon
        </div>
      </div>

      {/* ── Map area ── */}
      <div style={{ flex: 1, position: 'relative' }}>
        <IndiaMap
          compact={false}
          defaultFactor={factor}
          showControls={true}
        />
      </div>
    </motion.div>
  );
}
