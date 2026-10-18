import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import airQualityStationsData from '@data/airQualityStations.json';
import groundwaterWellsData from '@data/groundwaterWells.json';
import forestCoverDistrictsData from '@data/forestCoverDistricts.json';

// Helper for pressure / AQI color
function getAqiColor(status) {
  switch (status?.toLowerCase()) {
    case 'good': return '#10B981';
    case 'satisfactory': return '#06B6D4';
    case 'moderate': return '#F59E0B';
    case 'poor':
    case 'very poor': return '#EF4444';
    case 'severe':
    case 'critical / severe': return '#991B1B';
    default: return '#3B82F6';
  }
}

function getWaterStressColor(avgDtwl) {
  if (avgDtwl < 5.0) return '#10B981'; // Safe / shallow
  if (avgDtwl < 7.0) return '#3B82F6'; // Moderate
  if (avgDtwl < 10.0) return '#F59E0B'; // Semi-critical
  return '#EF4444'; // Over-exploited
}

function getForestTierColor(tier) {
  if (tier?.includes('Dense')) return '#059669';
  if (tier?.includes('Moderate')) return '#10B981';
  if (tier?.includes('Vulnerable')) return '#F59E0B';
  return '#DC2626';
}

export default function DistrictTelemetryView({ mode = 'citizen', defaultSection = 'air' }) {
  const [section, setSection] = useState(defaultSection); // 'air' | 'water' | 'forest'
  
  // Air Quality State
  const [selectedAirStation, setSelectedAirStation] = useState(airQualityStationsData[0]?.id || 'bkc_mumbai');
  const [selectedAirParam, setSelectedAirParam] = useState('PM2.5');

  // Groundwater State
  const [selectedDistrict, setSelectedDistrict] = useState('Ahmednagar');
  const [waterSearch, setWaterSearch] = useState('');

  // Forest Cover State
  const [forestSearch, setForestSearch] = useState('');
  const [forestSortBy, setForestSortBy] = useState('forestCoverPct'); // 'forestCoverPct' | 'totalForestSqKm' | 'changeVs2021SqKm'
  const [forestSortAsc, setForestSortAsc] = useState(false);

  // Active Air Station
  const currentStation = useMemo(() => {
    return airQualityStationsData.find((s) => s.id === selectedAirStation) || airQualityStationsData[0];
  }, [selectedAirStation]);

  // Active Groundwater District
  const currentGwDistrict = useMemo(() => {
    return (
      groundwaterWellsData.districts.find((d) => d.district.toLowerCase() === selectedDistrict.toLowerCase()) ||
      groundwaterWellsData.districts[0]
    );
  }, [selectedDistrict]);

  // Filtered Groundwater Districts
  const filteredGwDistricts = useMemo(() => {
    return groundwaterWellsData.districts.filter((d) =>
      d.district.toLowerCase().includes(waterSearch.toLowerCase())
    );
  }, [waterSearch]);

  // Filtered & Sorted Forest Districts
  const sortedForestDistricts = useMemo(() => {
    return [...forestCoverDistrictsData.allDistricts]
      .filter((d) => d.district.toLowerCase().includes(forestSearch.toLowerCase()))
      .sort((a, b) => {
        const factor = forestSortAsc ? 1 : -1;
        return (a[forestSortBy] - b[forestSortBy]) * factor;
      });
  }, [forestSearch, forestSortBy, forestSortAsc]);

  // 48-slot chart points for current station parameter
  const timelinePoints = useMemo(() => {
    if (!currentStation || !currentStation.timeline) return [];
    return currentStation.timeline.map((item, idx) => ({
      time: item.fromDate ? item.fromDate.split(' ')[1] : `T${idx}`,
      value: item[selectedAirParam] ?? null,
    }));
  }, [currentStation, selectedAirParam]);

  const validValues = timelinePoints.map((p) => p.value).filter((v) => v !== null);
  const maxVal = validValues.length > 0 ? Math.max(...validValues) : 100;
  const minVal = validValues.length > 0 ? Math.min(...validValues) : 0;
  const paramMeta = currentStation?.parameters?.[selectedAirParam];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8 overflow-hidden">
      {/* Header & Sub-navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              Empirical Sensor & Survey Data
            </span>
            <span className="text-xs text-gray-400 font-medium">Maharashtra State Telemetry</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">
            Ground-Truth Environmental Telemetry
          </h3>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Real data from CPCB continuous monitoring stations, CGWB 798 groundwater wells, and FSI 36-district canopy surveys.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center bg-gray-100/80 p-1.5 rounded-2xl gap-1 self-start md:self-auto">
          <button
            onClick={() => setSection('air')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              section === 'air'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>☁️</span> Air Quality (CPCB)
          </button>
          <button
            onClick={() => setSection('water')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              section === 'water'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>💧</span> Groundwater Wells (CGWB)
          </button>
          <button
            onClick={() => setSection('forest')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              section === 'forest'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>🌿</span> Forest Canopy (FSI)
          </button>
        </div>
      </div>

      {/* SECTION 1: AIR QUALITY */}
      {section === 'air' && (
        <div className="pt-6">
          {/* Station selector row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {airQualityStationsData.map((station) => {
              const isSelected = selectedAirStation === station.id;
              const aqiCol = getAqiColor(station.primaryAqiStatus);
              const pm25 = station.parameters['PM2.5']?.avg;
              const pm10 = station.parameters['PM10']?.avg;
              return (
                <div
                  key={station.id}
                  onClick={() => {
                    setSelectedAirStation(station.id);
                    if (!station.parameters[selectedAirParam]) {
                      const firstAvail = Object.keys(station.parameters)[0];
                      if (firstAvail) setSelectedAirParam(firstAvail);
                    }
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {station.city} · CPCB
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 leading-snug">
                        {station.stationName.split(',')[0]}
                      </h4>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${aqiCol}20`, color: aqiCol }}
                    >
                      {station.primaryAqiStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <div className="text-[10px] text-gray-400">PM2.5 Avg</div>
                      <div className="text-base font-bold text-gray-800">
                        {pm25 ? `${pm25} µg/m³` : 'N/A'}
                      </div>
                    </div>
                    <div className="w-px h-6 bg-gray-100" />
                    <div>
                      <div className="text-[10px] text-gray-400">PM10 Avg</div>
                      <div className="text-base font-bold text-gray-800">
                        {pm10 ? `${pm10} µg/m³` : 'N/A'}
                      </div>
                    </div>
                    <div className="ml-auto text-[11px] font-semibold text-blue-600">
                      {isSelected ? 'Active Station ✓' : 'Select →'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed parameters bar */}
          <div className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Parameter Inspection ({currentStation.stationName})
                </span>
                <div className="text-xs text-gray-400 mt-0.5">
                  Click a metric to inspect its 30-minute continuous telemetry timeline
                </div>
              </div>

              {/* Parameter pills */}
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(currentStation.parameters).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedAirParam(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedAirParam === p
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Current parameter stats cards */}
            {paramMeta ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-gray-200/70 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-gray-400">24hr Average</div>
                  <div className="text-2xl font-black text-gray-900 mt-1">
                    {paramMeta.avg}{' '}
                    <span className="text-xs font-medium text-gray-400">{paramMeta.unit}</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-gray-200/70 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Peak (Max)</div>
                  <div className="text-2xl font-black text-red-600 mt-1">
                    {paramMeta.max}{' '}
                    <span className="text-xs font-medium text-gray-400">{paramMeta.unit}</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-gray-200/70 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Lowest (Min)</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {paramMeta.min}{' '}
                    <span className="text-xs font-medium text-gray-400">{paramMeta.unit}</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-gray-200/70 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-gray-400">NAAQS 24hr Limit</div>
                  <div className="text-2xl font-black text-gray-700 mt-1">
                    {paramMeta.naaqs24h ?? '—'}{' '}
                    <span className="text-xs font-medium text-gray-400">{paramMeta.unit}</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-gray-200/70 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Compliance Status</div>
                  <div
                    className="text-sm font-bold mt-2 inline-block px-2.5 py-1 rounded-lg"
                    style={{
                      background: `${getAqiColor(paramMeta.status)}20`,
                      color: getAqiColor(paramMeta.status),
                    }}
                  >
                    {paramMeta.status}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Parameter not reported by this station.</div>
            )}
          </div>

          {/* Interactive SVG 30-min continuous timeline */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h5 className="text-sm font-bold text-gray-900">
                  30-Minute Continuous Telemetry Profile: {selectedAirParam}
                </h5>
                <span className="text-xs text-gray-400">
                  {currentStation.startDate} to {currentStation.endDate} (48 intervals)
                </span>
              </div>
              {paramMeta?.naaqs24h && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-0.5 bg-red-500 inline-block" />
                  <span className="text-gray-500 font-medium">NAAQS Limit ({paramMeta.naaqs24h} {paramMeta.unit})</span>
                </div>
              )}
            </div>

            {validValues.length > 0 ? (
              <div className="relative pt-4 pb-2">
                {/* SVG Line / Bar Chart */}
                <div className="h-44 w-full flex items-end gap-1 px-1">
                  {timelinePoints.map((pt, i) => {
                    const heightPct = pt.value !== null ? Math.max(5, (pt.value / (maxVal * 1.15)) * 100) : 0;
                    const isExceeding = paramMeta?.naaqs24h && pt.value > paramMeta.naaqs24h;
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center group relative h-full justify-end"
                      >
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-gray-900 text-white text-[10px] rounded-lg py-1 px-2 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                          <div className="font-bold">{pt.value !== null ? `${pt.value} ${paramMeta.unit}` : 'Missing'}</div>
                          <div className="text-gray-400 text-[9px]">{pt.time}</div>
                        </div>

                        {/* Bar */}
                        <div
                          className={`w-full rounded-t transition-all ${
                            isExceeding
                              ? 'bg-red-500 hover:bg-red-600'
                              : 'bg-blue-500 hover:bg-blue-600'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100 mt-2 px-1">
                  <span>16-Oct 00:00 (Night)</span>
                  <span>16-Oct 12:00 (Noon)</span>
                  <span>17-Oct 00:00 (Night)</span>
                  <span>17-Oct 12:00 (Noon)</span>
                  <span>17-Oct 23:59 (End)</span>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-sm text-gray-400">
                No recorded values for {selectedAirParam} at this station.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: GROUNDWATER WELLS */}
      {section === 'water' && (
        <div className="pt-6">
          {/* Overview summary banner */}
          <div className="bg-gradient-to-r from-blue-900 to-cyan-900 rounded-2xl p-6 text-white mb-6 shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  CGWB Ground Water Resource Assessment
                </span>
                <h4 className="text-2xl font-black mt-1">
                  798 Monitored Aquifers Across Maharashtra
                </h4>
                <p className="text-xs text-blue-100/80 max-w-xl mt-1">
                  Depth to Water Level (DTWL) recorded in meters below ground level (mbgl). Shallow water levels (&lt;5m) indicate healthy water tables, while depths &gt;10m represent high aquifer stress.
                </p>
              </div>

              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
                  <div className="text-[10px] text-blue-200">Statewide Avg Depth</div>
                  <div className="text-2xl font-black">{groundwaterWellsData.stateAvgDtwlMbgl} mbgl</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
                  <div className="text-[10px] text-blue-200">Districts Monitored</div>
                  <div className="text-2xl font-black">{groundwaterWellsData.districtsCovered}</div>
                </div>
              </div>
            </div>
          </div>

          {/* District selector grid & Detail Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: District List & Search */}
            <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-100 flex flex-col">
              <div className="mb-3">
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Monitored District
                </div>
                <input
                  type="text"
                  placeholder="Search district (e.g. Akola, Nevasa)..."
                  value={waterSearch}
                  onChange={(e) => setWaterSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {filteredGwDistricts.map((d) => {
                  const isSelected = selectedDistrict.toLowerCase() === d.district.toLowerCase();
                  const stressColor = getWaterStressColor(d.avgDtwlMbgl);
                  return (
                    <button
                      key={d.district}
                      onClick={() => setSelectedDistrict(d.district)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold leading-none">{d.district}</div>
                        <div className={`text-[10px] mt-1 ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>
                          {d.totalWells} wells · {d.blocksCount} blocks
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-black ${isSelected ? 'text-white' : ''}`} style={{ color: isSelected ? '#fff' : stressColor }}>
                          {d.avgDtwlMbgl} mbgl
                        </div>
                        <span className={`text-[9px] font-semibold ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                          {d.riskCategory.split('/')[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected District Analytics */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Aquifer Status & Well Distribution
                    </span>
                    <h4 className="text-xl font-bold text-gray-900 mt-0.5">
                      {currentGwDistrict.district} District
                    </h4>
                  </div>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full border"
                    style={{
                      background: `${getWaterStressColor(currentGwDistrict.avgDtwlMbgl)}15`,
                      color: getWaterStressColor(currentGwDistrict.avgDtwlMbgl),
                      borderColor: `${getWaterStressColor(currentGwDistrict.avgDtwlMbgl)}30`,
                    }}
                  >
                    {currentGwDistrict.riskCategory}
                  </span>
                </div>

                {/* 4 Metric cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Average Depth</div>
                    <div className="text-xl font-black text-gray-900 mt-1">
                      {currentGwDistrict.avgDtwlMbgl} <span className="text-xs font-normal">mbgl</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Shallowest Well</div>
                    <div className="text-xl font-black text-emerald-600 mt-1">
                      {currentGwDistrict.minDtwlMbgl} <span className="text-xs font-normal">mbgl</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Deepest Well</div>
                    <div className="text-xl font-black text-red-600 mt-1">
                      {currentGwDistrict.maxDtwlMbgl} <span className="text-xs font-normal">mbgl</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Monitored Wells</div>
                    <div className="text-xl font-black text-blue-600 mt-1">
                      {currentGwDistrict.totalWells} <span className="text-xs font-normal">sites</span>
                    </div>
                  </div>
                </div>

                {/* Well Depth Category Breakdown */}
                <div className="mb-6">
                  <div className="text-xs font-bold text-gray-700 mb-2">Aquifer Depth Distribution (798-Well Dataset)</div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          Shallow Water Table (&lt;5 mbgl - Safe Recharge)
                        </span>
                        <span className="font-bold text-gray-900">
                          {currentGwDistrict.shallowCount} wells ({Math.round((currentGwDistrict.shallowCount / currentGwDistrict.totalWells) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(currentGwDistrict.shallowCount / currentGwDistrict.totalWells) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          Moderate Water Table (5 - 10 mbgl - Equilibrium)
                        </span>
                        <span className="font-bold text-gray-900">
                          {currentGwDistrict.moderateCount} wells ({Math.round((currentGwDistrict.moderateCount / currentGwDistrict.totalWells) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(currentGwDistrict.moderateCount / currentGwDistrict.totalWells) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          Deep Aquifer (10 - 20 mbgl - Semi-Critical)
                        </span>
                        <span className="font-bold text-gray-900">
                          {currentGwDistrict.deepCount} wells ({Math.round((currentGwDistrict.deepCount / currentGwDistrict.totalWells) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${(currentGwDistrict.deepCount / currentGwDistrict.totalWells) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                          Critical Aquifer Depletion (&gt;20 mbgl - Severe Stress)
                        </span>
                        <span className="font-bold text-gray-900">
                          {currentGwDistrict.criticalCount} wells ({Math.round((currentGwDistrict.criticalCount / currentGwDistrict.totalWells) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600 rounded-full"
                          style={{ width: `${(currentGwDistrict.criticalCount / currentGwDistrict.totalWells) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action recommendation note */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 flex items-start gap-3">
                <span className="text-base">💡</span>
                <div>
                  <span className="font-bold">Water Management Guidance for {currentGwDistrict.district}:</span>{' '}
                  {currentGwDistrict.avgDtwlMbgl > 7
                    ? 'Implement rooftop rainwater harvesting, artificial aquifer injection borewells, and restrict unrestricted summer agricultural tube well pumping.'
                    : 'Maintain watershed contour trenches and preserve natural lake recharge wetlands to sustain the safe water table.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: FOREST COVER */}
      {section === 'forest' && (
        <div className="pt-6">
          {/* FSI State Summary Card */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
              <div className="text-[10px] font-bold uppercase text-emerald-800">Total Forest Canopy</div>
              <div className="text-2xl font-black text-emerald-950 mt-1">
                {forestCoverDistrictsData.summary.totalForestSqKm.toLocaleString()}{' '}
                <span className="text-xs font-normal">sq km</span>
              </div>
              <div className="text-[10px] text-emerald-700 mt-1 font-semibold">
                {forestCoverDistrictsData.summary.forestCoverPct}% of Maharashtra
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
              <div className="text-[10px] font-bold uppercase text-gray-500">Very Dense Forest</div>
              <div className="text-2xl font-black text-gray-900 mt-1">
                {forestCoverDistrictsData.summary.veryDenseForestSqKm.toLocaleString()}{' '}
                <span className="text-xs font-normal">sq km</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1">Canopy density &gt; 70%</div>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
              <div className="text-[10px] font-bold uppercase text-gray-500">Mod. Dense Forest</div>
              <div className="text-2xl font-black text-gray-900 mt-1">
                {forestCoverDistrictsData.summary.modDenseForestSqKm.toLocaleString()}{' '}
                <span className="text-xs font-normal">sq km</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1">Canopy density 40–70%</div>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
              <div className="text-[10px] font-bold uppercase text-gray-500">Open Forest</div>
              <div className="text-2xl font-black text-gray-900 mt-1">
                {forestCoverDistrictsData.summary.openForestSqKm.toLocaleString()}{' '}
                <span className="text-xs font-normal">sq km</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1">Canopy density 10–40%</div>
            </div>

            <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl">
              <div className="text-[10px] font-bold uppercase text-amber-800">National 33% Gap</div>
              <div className="text-2xl font-black text-amber-950 mt-1">
                -{forestCoverDistrictsData.summary.deficitPct}%
              </div>
              <div className="text-[10px] text-amber-700 mt-1 font-semibold">Afforestation Deficit</div>
            </div>
          </div>

          {/* 36 Districts Table with controls */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
            <div className="p-4 bg-gray-50/60 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-800">
                  36 Districts Survey Matrix (FSI / Survey of India)
                </span>
                <span className="text-[11px] text-gray-400">
                  {sortedForestDistricts.length} districts listed
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter by district (e.g. Pune, Gadchiroli)..."
                  value={forestSearch}
                  onChange={(e) => setForestSearch(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                />

                <button
                  onClick={() => {
                    const csvContent =
                      'data:text/csv;charset=utf-8,' +
                      'District,Geographical Area (sq km),Very Dense,Mod Dense,Open Forest,Total Forest,Canopy %,Change vs 2021,Scrub\n' +
                      forestCoverDistrictsData.allDistricts
                        .map(
                          (d) =>
                            `"${d.district}",${d.geoAreaSqKm},${d.veryDenseForestSqKm},${d.modDenseForestSqKm},${d.openForestSqKm},${d.totalForestSqKm},${d.forestCoverPct},${d.changeVs2021SqKm},${d.scrubForestSqKm}`
                        )
                        .join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', 'maharashtra_forest_cover_36_districts.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1.5"
                >
                  <span>📥</span> Export CSV
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50/80 sticky top-0 z-10 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4 font-bold">District</th>
                    <th
                      className="py-2.5 px-3 font-bold cursor-pointer hover:text-gray-900"
                      onClick={() => {
                        if (forestSortBy === 'forestCoverPct') setForestSortAsc(!forestSortAsc);
                        else { setForestSortBy('forestCoverPct'); setForestSortAsc(false); }
                      }}
                    >
                      Canopy % {forestSortBy === 'forestCoverPct' ? (forestSortAsc ? '↑' : '↓') : ''}
                    </th>
                    <th
                      className="py-2.5 px-3 font-bold cursor-pointer hover:text-gray-900"
                      onClick={() => {
                        if (forestSortBy === 'totalForestSqKm') setForestSortAsc(!forestSortAsc);
                        else { setForestSortBy('totalForestSqKm'); setForestSortAsc(false); }
                      }}
                    >
                      Total Forest {forestSortBy === 'totalForestSqKm' ? (forestSortAsc ? '↑' : '↓') : ''}
                    </th>
                    <th className="py-2.5 px-3 font-bold">Very Dense</th>
                    <th className="py-2.5 px-3 font-bold">Mod. Dense</th>
                    <th className="py-2.5 px-3 font-bold">Open Forest</th>
                    <th
                      className="py-2.5 px-3 font-bold cursor-pointer hover:text-gray-900"
                      onClick={() => {
                        if (forestSortBy === 'changeVs2021SqKm') setForestSortAsc(!forestSortAsc);
                        else { setForestSortBy('changeVs2021SqKm'); setForestSortAsc(false); }
                      }}
                    >
                      2021 Change {forestSortBy === 'changeVs2021SqKm' ? (forestSortAsc ? '↑' : '↓') : ''}
                    </th>
                    <th className="py-2.5 px-3 font-bold">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedForestDistricts.map((d) => (
                    <tr key={d.district} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-gray-900 flex items-center gap-1.5">
                        {d.district}
                        {d.isHillDistrict && (
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                            Hill
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-gray-800">
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={{
                            background: `${getForestTierColor(d.tier)}18`,
                            color: getForestTierColor(d.tier),
                          }}
                        >
                          {d.forestCoverPct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-gray-700">
                        {d.totalForestSqKm.toLocaleString()} sq km
                      </td>
                      <td className="py-2.5 px-3 text-gray-500">
                        {d.veryDenseForestSqKm > 0 ? `${d.veryDenseForestSqKm} sq km` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-500">{d.modDenseForestSqKm} sq km</td>
                      <td className="py-2.5 px-3 text-gray-500">{d.openForestSqKm} sq km</td>
                      <td className="py-2.5 px-3 font-semibold">
                        <span className={d.changeVs2021SqKm >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                          {d.changeVs2021SqKm >= 0 ? `+${d.changeVs2021SqKm}` : d.changeVs2021SqKm} sq km
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] font-semibold text-gray-600">{d.tier}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
