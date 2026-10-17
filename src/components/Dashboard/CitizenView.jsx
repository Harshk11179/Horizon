/**
 * CitizenView.jsx — simplified environmental view for citizens
 * Now includes an embedded compact IndiaMap driven by real scores.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import IndiaMap from './IndiaMap';
import CommunityActionsModal from './CommunityActionsModal';
import { latestStateScores, pressureColour, riskBand } from '@hooks/useStateScores';

const GRADE_COLOR = { A: '#2E7D32', B: '#F9A825', C: '#E65100', D: '#B71C1C' };

export default function CitizenView() {
  const [selected, setSelected] = useState(latestStateScores[0]?.state_code ?? 'KA');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const stateData = latestStateScores.find((s) => s.state_code === selected) ?? latestStateScores[0];

  const CARDS = [
    {
      title: 'Air Quality (PM2.5)',
      icon: '☁️',
      score: stateData?.air_pollution_score,
      unit: 'µg/m³',
      action: stateData?.air_pollution_score > 50 ? 'Avoid outdoor activities' : 'Air is acceptable today',
    },
    {
      title: 'Forest Cover',
      icon: '🌿',
      score: stateData?.forest_cover_score,
      unit: 'pressure',
      action: stateData?.forest_cover_score > 50 ? 'Advocate for afforestation' : 'Good tree coverage',
    },
    {
      title: 'Groundwater',
      icon: '💧',
      score: stateData?.groundwater_score,
      unit: 'extraction %',
      action: stateData?.groundwater_score > 75 ? 'Conserve water urgently' : 'Use water mindfully',
    },
    {
      title: 'Fertiliser Load',
      icon: '🌾',
      score: stateData?.fertiliser_nutrients_score,
      unit: 'kg/ha',
      action: stateData?.fertiliser_nutrients_score > 60 ? 'Prefer organic produce' : 'Moderate farm chemicals',
    },
    {
      title: 'Hazardous Waste',
      icon: '⚠️',
      score: stateData?.hazardous_waste_score,
      unit: 'tonnes/yr',
      action: stateData?.hazardous_waste_score > 50 ? 'Demand stricter disposal' : 'Waste managed reasonably',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 max-w-7xl mx-auto min-h-[calc(100vh-64px)] bg-[#f8fafc] pb-24"
    >
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Your Environment, Simplified</h2>
          <p className="text-gray-500 text-sm">Select a state on the map or from the list to explore its scores 🌍</p>
        </div>
        {/* State picker */}
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
        >
          {latestStateScores.map((s) => (
            <option key={s.state_code} value={s.state_code}>{s.state_name}</option>
          ))}
        </select>
      </div>

      {/* Map + Score summary */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
        {/* Compact map */}
        <div className="lg:col-span-3 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group" style={{ minHeight: 340 }}>
          <IndiaMap compact defaultFactor="overall" showControls={false} />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-gray-700 shadow-sm border border-gray-200/50 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Regional Data
          </div>
        </div>

        {/* State summary card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900">{stateData?.state_name}</h3>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full border"
                style={{
                  background: pressureColour(stateData?.overall_score) + '15',
                  color: pressureColour(stateData?.overall_score),
                  borderColor: pressureColour(stateData?.overall_score) + '30',
                }}
              >
                Grade {stateData?.grade}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-semibold text-gray-700">{stateData?.risk_band} Risk</span> · {stateData?.coverage_pct}% data coverage
            </p>

            {/* Score bar */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span className="font-medium">Environmental Pressure</span>
                <span className="font-bold" style={{ color: pressureColour(stateData?.overall_score) }}>
                  {stateData?.overall_score?.toFixed(1)} / 100
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${stateData?.overall_score ?? 0}%`,
                    background: `linear-gradient(90deg, #2E7D32, ${pressureColour(stateData?.overall_score)})`,
                  }}
                />
              </div>
            </div>

            {/* Top pressures */}
            <div className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="font-bold text-gray-800 block mb-1">Critical Pressures:</span>
              {stateData?.top_pressure_dimensions}
            </div>
          </div>

          {/* All-state quick list */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Compare States</div>
            <div className="grid grid-cols-2 gap-1.5 h-32 overflow-y-auto pr-2 custom-scrollbar">
              {latestStateScores.map((s) => (
                <button
                  key={s.state_code}
                  onClick={() => setSelected(s.state_code)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all text-left border ${selected === s.state_code ? 'bg-blue-50 border-blue-100' : 'bg-transparent border-transparent hover:bg-gray-50'}`}
                >
                  <span
                    style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: pressureColour(s.overall_score),
                      flexShrink: 0,
                    }}
                  />
                  <span className={`text-xs font-medium truncate ${selected === s.state_code ? 'text-blue-700' : 'text-gray-600'}`}>{s.state_name}</span>
                  <span className="ml-auto text-[11px] font-bold" style={{ color: pressureColour(s.overall_score) }}>
                    {s.overall_score?.toFixed(0)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Indicator cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {CARDS.map((card, i) => {
          const colour = pressureColour(card.score);
          const band = riskBand(card.score);
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md hover:-translate-y-1 transition-all cursor-default relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: colour }} />
              <div className="text-3xl mb-3 mt-1 bg-gray-50/50 w-14 h-14 rounded-2xl flex items-center justify-center border border-gray-100">{card.icon}</div>
              <h3 className="text-xs font-bold text-gray-500 mb-2">{card.title}</h3>
              <div className="text-xl font-black tracking-tight mb-0.5" style={{ color: colour }}>
                {card.score != null ? card.score.toFixed(1) : '—'}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-4">{band}</div>
              <div className="mt-auto pt-3 border-t border-gray-100 w-full text-xs font-semibold text-gray-600">
                {card.action}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Enhanced CTA Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative bg-gradient-to-br from-indigo-900 to-blue-900 rounded-3xl p-8 overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 -left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white flex-1">
            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-wider text-blue-200 mb-3 border border-white/10 backdrop-blur-sm">
              TAKE ACTION TODAY
            </span>
            <h3 className="text-3xl md:text-4xl font-black mb-3 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
              Transform Insights<br/>Into Local Impact.
            </h3>
            <p className="text-blue-100/80 text-sm md:text-base max-w-lg leading-relaxed">
              Horizon goes beyond data. Connect with verified NGOs, participate in community recycling drives, plant trees, and track your personal sustainability footprint in {stateData?.state_name}.
            </p>
          </div>
          
          <div className="flex-shrink-0 flex flex-col gap-3 w-full md:w-auto">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 bg-white text-blue-900 rounded-2xl font-bold shadow-[0_8px_30px_rgb(255,255,255,0.2)] hover:shadow-[0_8px_30px_rgb(255,255,255,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-lg"
            >
              Explore Communities <span>🌍</span>
            </button>
            <p className="text-xs text-blue-200/60 text-center font-medium">Join 12,000+ active citizens in your area</p>
          </div>
        </div>
      </motion.div>

      {/* Full-screen Overlay Modal */}
      <CommunityActionsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        stateName={stateData?.state_name} 
      />
    </motion.div>
  );
}
