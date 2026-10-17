/**
 * ProfessionalView.jsx — data-rich dashboard for analysts / engineers
 * Left panel: compact IndiaMap (choropleth, factor switchable)
 * Right panel: dimension scores, heatmap table, trend sparklines
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import IndiaMap from './IndiaMap';
import { latestStateScores, pressureColour, riskBand } from '@hooks/useStateScores';
import stateScores from '@data/stateScores.json';
import dimensionScores from '@data/dimensionScores.json';

const TABS = ['Overview', 'Data Explorer', 'Models & Forecasts', 'Alerts', 'Reports', 'API & Resources'];

const DIM_LABELS = {
  air_pollution:        'Air Pollution',
  forest_cover:         'Forest Cover',
  groundwater:          'Groundwater',
  fertiliser_nutrients: 'Fertiliser',
  hazardous_waste:      'Hazardous Waste',
};

function Sparkline({ values = [], colour = '#3B82F6' }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * 120},${60 - (v / max) * 50}`)
    .join(' ');
  return (
    <svg width={120} height={60} viewBox="0 0 120 60" style={{ overflow: 'visible' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={colour}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Dimension score heatmap row
function HeatmapRow({ row }) {
  const dims = ['air_pollution', 'forest_cover', 'groundwater', 'fertiliser_nutrients', 'hazardous_waste'];
  return (
    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
      <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
        {row.state_name}
        <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 4 }}>({row.year})</span>
      </td>
      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
        <span
          style={{
            fontSize: 11, fontWeight: 700,
            color: pressureColour(row.overall_score),
            background: pressureColour(row.overall_score) + '18',
            padding: '2px 8px', borderRadius: 999,
          }}
        >
          {row.overall_score?.toFixed(1)} {row.grade}
        </span>
      </td>
      {dims.map((d) => {
        const scoreKey = `${d}_score`;
        const val = row[scoreKey];
        return (
          <td key={d} style={{ padding: '8px 8px', textAlign: 'center' }}>
            {val != null ? (
              <div
                style={{
                  display: 'inline-block',
                  width: 32, height: 32, borderRadius: 6,
                  background: pressureColour(val),
                  color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  lineHeight: '32px',
                }}
                title={`${DIM_LABELS[d]}: ${val.toFixed(1)}`}
              >
                {val.toFixed(0)}
              </div>
            ) : (
              <span style={{ fontSize: 10, color: '#d1d5db' }}>—</span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

export default function ProfessionalView() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedState, setSelectedState] = useState(latestStateScores[0]?.state_code ?? 'MH');
  const [factor, setFactor] = useState('overall');

  const stateData = latestStateScores.find((s) => s.state_code === selectedState) ?? latestStateScores[0];

  // Year-wise rows for this state (for sparklines)
  const stateHistory = stateScores
    .filter((r) => r.state_code === selectedState)
    .sort((a, b) => a.year - b.year);

  const overallTrend = stateHistory.map((r) => r.overall_score ?? 0);
  const airTrend     = stateHistory.map((r) => r.air_pollution_score ?? 0);
  const gwTrend      = stateHistory.map((r) => r.groundwater_score ?? 0);

  // Most-data rows per state for heatmap
  const heatmapRows = latestStateScores;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-[calc(100vh-64px)] bg-[#f8fafc]"
    >
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Tab header */}
          <div className="flex items-center gap-6 px-6 border-b border-gray-100 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="py-4 text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors"
                style={{
                  borderBottom: activeTab === tab ? '2px solid #3B82F6' : '2px solid transparent',
                  color: activeTab === tab ? '#3B82F6' : '#6b7280',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filters bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/40 flex-wrap gap-3">
            <div className="flex gap-3 flex-wrap">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none"
              >
                {latestStateScores.map((s) => (
                  <option key={s.state_code} value={s.state_code}>{s.state_name}</option>
                ))}
              </select>
              <select
                value={factor}
                onChange={(e) => setFactor(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none"
              >
                <option value="overall">All Factors</option>
                <option value="air_pollution">Air Pollution</option>
                <option value="groundwater">Groundwater</option>
                <option value="forest_cover">Forest Cover</option>
                <option value="fertiliser">Fertiliser</option>
                <option value="hazardous">Hazardous Waste</option>
              </select>
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 flex items-center gap-2">
                📅 2022–2024
              </div>
            </div>
            <button className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors">
              Export Report
            </button>
          </div>

          {/* Main content */}
          <div className="flex gap-5 p-5">
            {/* Left: Map */}
            <div
              className="flex-[2] rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100"
              style={{ minHeight: 480 }}
            >
              <IndiaMap compact={false} defaultFactor={factor} showControls={true} />
            </div>

            {/* Right: Metric cards + sparklines */}
            <div className="flex-1 flex flex-col gap-4" style={{ minWidth: 220 }}>
              {/* Overall */}
              <div
                className="bg-white p-4 rounded-xl border shadow-sm"
                style={{ borderTop: `3px solid ${pressureColour(stateData?.overall_score)}` }}
              >
                <div className="text-xs font-semibold text-gray-500 mb-1">Overall Pressure Score</div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-3xl font-bold" style={{ color: pressureColour(stateData?.overall_score) }}>
                      {stateData?.overall_score?.toFixed(1) ?? '—'}
                    </div>
                    <div className="text-xs font-semibold text-gray-600">{stateData?.risk_band} · Grade {stateData?.grade}</div>
                  </div>
                  <Sparkline values={overallTrend} colour={pressureColour(stateData?.overall_score)} />
                </div>
              </div>

              {/* Air */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="text-xs font-semibold text-gray-500 mb-1">Air Pollution (PM2.5)</div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-3xl font-bold text-gray-800">
                      {stateData?.air_pollution_score?.toFixed(1) ?? '—'}
                    </div>
                    <div className="text-xs text-gray-500">{riskBand(stateData?.air_pollution_score)}</div>
                  </div>
                  <Sparkline values={airTrend} colour="#EF4444" />
                </div>
              </div>

              {/* Groundwater */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="text-xs font-semibold text-gray-500 mb-1">Groundwater Stress</div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-3xl font-bold text-gray-800">
                      {stateData?.groundwater_score?.toFixed(1) ?? '—'}
                    </div>
                    <div className="text-xs text-gray-500">{riskBand(stateData?.groundwater_score)}</div>
                  </div>
                  <Sparkline values={gwTrend} colour="#3B82F6" />
                </div>
              </div>

              {/* Forest */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="text-xs font-semibold text-gray-500 mb-1">Forest Cover</div>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-gray-800">
                    {stateData?.forest_cover_score?.toFixed(1) ?? '—'}
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{
                      background: pressureColour(stateData?.forest_cover_score) + '20',
                      color: pressureColour(stateData?.forest_cover_score),
                    }}
                  >
                    {riskBand(stateData?.forest_cover_score)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Heatmap table */}
          <div className="px-5 pb-5">
            <div className="text-sm font-bold text-gray-800 mb-3">State × Dimension Heatmap</div>
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#6b7280', textAlign: 'left' }}>State</th>
                    <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#6b7280', textAlign: 'center' }}>Overall</th>
                    {Object.entries(DIM_LABELS).map(([k, v]) => (
                      <th key={k} style={{ padding: '10px 8px', fontSize: 11, fontWeight: 700, color: '#6b7280', textAlign: 'center' }}>{v}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapRows.map((row) => (
                    <HeatmapRow key={row.state_code} row={row} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
