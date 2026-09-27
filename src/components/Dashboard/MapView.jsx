import { motion } from 'framer-motion';

export default function MapView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex h-[calc(100vh-64px)] w-full bg-[#f8fafc] overflow-hidden"
    >
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 flex flex-col gap-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Search State / City"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <span className="absolute left-3.5 top-3 text-gray-400">🔍</span>
        </div>

        <div className="flex flex-col gap-4">
          <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none">
            <option>All States</option>
            <option>Karnataka</option>
            <option>Maharashtra</option>
          </select>

          <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none">
            <option>All Environmental Factors</option>
            <option>Air Quality (AQI)</option>
            <option>Water Quality</option>
          </select>
        </div>

        <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <span>📚</span> Layers
        </button>

        <div className="mt-auto">
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500" />
            <h3 className="font-semibold text-gray-900 mb-1">Bengaluru, Karnataka</h3>
            <div className="text-xs text-gray-500 mb-4">Updated: 10:30 AM, 13 May 2025</div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Air Quality Index (AQI)</span>
                <span className="text-sm font-bold text-red-500">178 (Unhealthy)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">PM2.5</span>
                <span className="text-sm font-medium text-gray-900">96 µg/m³</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">PM10</span>
                <span className="text-sm font-medium text-gray-900">152 µg/m³</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Temp.</span>
                <span className="text-sm font-medium text-gray-900">33°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Humidity</span>
                <span className="text-sm font-medium text-gray-900">62%</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
                <span className="text-sm text-gray-500">Trend</span>
                <span className="text-sm font-medium text-red-500 flex items-center gap-1">↑ Worsening</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-[#e2e8f0]">
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/India_map_en.svg/800px-India_map_en.svg.png" alt="India Map" className="h-[90%] object-contain drop-shadow-2xl opacity-60" style={{ filter: 'hue-rotate(200deg) saturate(1.5)' }} />
        </div>
        
        {/* Map Controls */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <button className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors font-bold text-xl">+</button>
          <button className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors font-bold text-xl">-</button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center justify-between text-xs font-medium text-gray-600">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-[#10B981]" /> Good (0-50)</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-[#FBBF24]" /> Moderate (51-100)</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-[#F97316]" /> Unhealthy (101-200)</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-[#EF4444]" /> Very Unhealthy (201-300)</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-[#8B5CF6]" /> Hazardous (301+)</div>
          </div>
          <button className="text-blue-600 hover:underline">View Data Sources</button>
        </div>
      </div>
    </motion.div>
  );
}
