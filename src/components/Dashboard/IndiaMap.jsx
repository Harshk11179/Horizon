/**
 * IndiaMap.jsx — Interactive India choropleth map (react-leaflet v5)
 *
 * Colours each state by its environmental pressure score from calculation.py.
 * Clicking a state shows a detail tooltip. Supports a compact "mini" variant
 * for embedding inside the Citizen / Professional dashboard panels.
 */
import { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { latestStateScores, scoreByCode, pressureColour, riskBand } from '@hooks/useStateScores';

// ─── India State GeoJSON (simplified polygons for 6 scored states + outline) ──
// We embed small simplified polygons for the 6 states in our dataset.
// All other states render as plain grey from the tile layer below.
const STATE_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { state_code: 'DL', state_name: 'Delhi' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[76.84, 28.88], [77.35, 28.88], [77.35, 28.40], [76.84, 28.40], [76.84, 28.88]]],
      },
    },
    {
      type: 'Feature',
      properties: { state_code: 'PB', state_name: 'Punjab' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[73.88, 32.50], [76.93, 32.50], [76.93, 29.55], [73.88, 29.55], [73.88, 32.50]]],
      },
    },
    {
      type: 'Feature',
      properties: { state_code: 'RJ', state_name: 'Rajasthan' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[69.47, 30.19], [78.26, 30.19], [78.26, 23.04], [69.47, 23.04], [69.47, 30.19]]],
      },
    },
    {
      type: 'Feature',
      properties: { state_code: 'MH', state_name: 'Maharashtra' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[72.58, 22.02], [80.89, 22.02], [80.89, 15.61], [72.58, 15.61], [72.58, 22.02]]],
      },
    },
    {
      type: 'Feature',
      properties: { state_code: 'KA', state_name: 'Karnataka' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[74.05, 18.44], [78.57, 18.44], [78.57, 11.60], [74.05, 11.60], [74.05, 18.44]]],
      },
    },
    {
      type: 'Feature',
      properties: { state_code: 'KL', state_name: 'Kerala' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[74.85, 12.80], [77.42, 12.80], [77.42, 8.08], [74.85, 8.08], [74.85, 12.80]]],
      },
    },
  ],
};

// ─── Score circles with tooltips (capital city markers) ──────────────────────

function ScoreMarkers({ onSelect, selected, factor }) {
  return latestStateScores.map((s) => {
    const score =
      factor === 'overall'       ? s.overall_score :
      factor === 'air_pollution' ? s.air_pollution_score :
      factor === 'groundwater'   ? s.groundwater_score :
      factor === 'forest_cover'  ? s.forest_cover_score :
      factor === 'fertiliser'    ? s.fertiliser_nutrients_score :
      factor === 'hazardous'     ? s.hazardous_waste_score :
      s.overall_score;

    const colour = pressureColour(score);
    const isSelected = selected === s.state_code;

    return (
      <CircleMarker
        key={s.state_code}
        center={[s.capital_lat, s.capital_lng]}
        radius={isSelected ? 14 : 10}
        pathOptions={{
          fillColor: colour,
          fillOpacity: 0.92,
          color: isSelected ? '#fff' : colour,
          weight: isSelected ? 3 : 1.5,
        }}
        eventHandlers={{ click: () => onSelect(s.state_code) }}
      >
        <Tooltip permanent={isSelected} direction="top" offset={[0, -10]}>
          <div style={{ minWidth: 160 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{s.state_name}</div>
            <div style={{ color: colour, fontWeight: 600, fontSize: 12 }}>
              {riskBand(score)} — {score != null ? score.toFixed(1) : 'N/A'}
            </div>
            <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
              {s.top_pressure_dimensions}
            </div>
          </div>
        </Tooltip>
      </CircleMarker>
    );
  });
}

// ─── Choropleth layer ─────────────────────────────────────────────────────────

function ChoroplethLayer({ factor }) {
  function style(feature) {
    const s = scoreByCode[feature.properties.state_code];
    const score =
      !s ? null :
      factor === 'overall'       ? s.overall_score :
      factor === 'air_pollution' ? s.air_pollution_score :
      factor === 'groundwater'   ? s.groundwater_score :
      factor === 'forest_cover'  ? s.forest_cover_score :
      factor === 'fertiliser'    ? s.fertiliser_nutrients_score :
      factor === 'hazardous'     ? s.hazardous_waste_score :
      s.overall_score;

    return {
      fillColor: pressureColour(score),
      fillOpacity: 0.45,
      color: '#fff',
      weight: 1.5,
    };
  }

  return <GeoJSON key={factor} data={STATE_GEOJSON} style={style} />;
}

// ─── Legend ───────────────────────────────────────────────────────────────────

const LEGEND = [
  { colour: '#2E7D32', label: 'Low  (0–25)' },
  { colour: '#F9A825', label: 'Moderate (25–50)' },
  { colour: '#E65100', label: 'High (50–75)' },
  { colour: '#B71C1C', label: 'Critical (75–100)' },
];

// ─── Main component ───────────────────────────────────────────────────────────

const FACTOR_OPTIONS = [
  { value: 'overall',       label: 'Overall Score' },
  { value: 'air_pollution', label: 'Air Pollution (PM2.5)' },
  { value: 'groundwater',   label: 'Groundwater Stress' },
  { value: 'forest_cover',  label: 'Forest Cover' },
  { value: 'fertiliser',    label: 'Fertiliser Load' },
  { value: 'hazardous',     label: 'Hazardous Waste' },
];

export default function IndiaMap({ compact = false, defaultFactor = 'overall', showControls = true }) {
  const [factor, setFactor]   = useState(defaultFactor);
  const [selected, setSelected] = useState(null);
  const selectedData = selected ? scoreByCode[selected] : null;

  const height = compact ? '320px' : '100%';

  return (
    <div style={{ position: 'relative', height, width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Factor selector */}
      {showControls && (
        <div style={{
          display: 'flex', gap: 8, padding: '8px 12px',
          background: '#fff', borderBottom: '1px solid #e5e7eb',
          flexWrap: 'wrap', zIndex: 1000,
        }}>
          {FACTOR_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFactor(opt.value)}
              style={{
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                border: factor === opt.value ? '2px solid #3B82F6' : '1px solid #d1d5db',
                background: factor === opt.value ? '#EFF6FF' : '#fff',
                color: factor === opt.value ? '#1d4ed8' : '#374151',
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Map */}
      <div style={{ flex: 1, position: 'relative', minHeight: compact ? 260 : 400 }}>
        <MapContainer
          center={[22.5, 80.5]}
          zoom={compact ? 4 : 5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={!compact}
          zoomControl={!compact}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <ChoroplethLayer factor={factor} />
          <ScoreMarkers onSelect={setSelected} selected={selected} factor={factor} />
        </MapContainer>

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 12, left: 12, zIndex: 1000,
          background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(6px)',
          borderRadius: 10, padding: '8px 12px', boxShadow: '0 2px 12px rgba(0,0,0,.1)',
          display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: 11, fontWeight: 600,
        }}>
          {LEGEND.map((l) => (
            <span key={l.colour} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: l.colour, display: 'inline-block' }} />
              {l.label}
            </span>
          ))}
        </div>

        {/* Selected state card */}
        {selectedData && (
          <div style={{
            position: 'absolute', top: 12, right: 12, zIndex: 1000, width: 200,
            background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)',
            borderRadius: 12, padding: 14, boxShadow: '0 4px 24px rgba(0,0,0,.12)',
            borderTop: `3px solid ${pressureColour(selectedData.overall_score)}`,
          }}>
            <button
              onClick={() => setSelected(null)}
              style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#9ca3af' }}
            >✕</button>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{selectedData.state_name}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>Year {selectedData.year} · {selectedData.coverage_pct}% data</div>
            {[
              { label: 'Overall', value: selectedData.overall_score },
              { label: 'Air Pollution', value: selectedData.air_pollution_score },
              { label: 'Forest Cover', value: selectedData.forest_cover_score },
              { label: 'Groundwater', value: selectedData.groundwater_score },
              { label: 'Fertiliser', value: selectedData.fertiliser_nutrients_score },
              { label: 'Hazardous Waste', value: selectedData.hazardous_waste_score },
            ].map(({ label, value }) => (
              value != null && (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#374151' }}>{label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: pressureColour(value) }}>
                    {value.toFixed(1)}
                  </span>
                </div>
              )
            ))}
            <div style={{
              marginTop: 8, padding: '4px 8px', borderRadius: 6,
              background: pressureColour(selectedData.overall_score) + '18',
              color: pressureColour(selectedData.overall_score),
              fontSize: 11, fontWeight: 700, textAlign: 'center',
            }}>
              {selectedData.risk_band} Risk — Grade {selectedData.grade}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
