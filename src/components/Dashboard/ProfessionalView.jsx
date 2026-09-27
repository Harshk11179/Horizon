import { motion } from 'framer-motion';

export default function ProfessionalView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 max-w-7xl mx-auto min-h-[calc(100vh-64px)] bg-[#f8fafc]"
    >
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Tab Header */}
        <div className="flex items-center gap-8 px-8 border-b border-gray-100 bg-white">
          <button className="py-4 border-b-2 border-blue-600 text-blue-600 font-semibold text-sm">Overview</button>
          <button className="py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-900 font-medium text-sm">Data Explorer</button>
          <button className="py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-900 font-medium text-sm">Models & Forecasts</button>
          <button className="py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-900 font-medium text-sm">Alerts</button>
          <button className="py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-900 font-medium text-sm">Reports</button>
          <button className="py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-900 font-medium text-sm">API & Resources</button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex gap-4">
            <select className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>Bengaluru, Karnataka</option>
            </select>
            <select className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>All Factors</option>
            </select>
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 flex items-center gap-2">
              <span>📅</span> 07 May 2025 - 13 May 2025
            </div>
          </div>
          <button className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
            Export Report
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="flex p-6 gap-6">
          {/* Heatmap Area */}
          <div className="flex-[2] relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-[#f1f5f9] min-h-[500px]">
             {/* Mock Map Background */}
             <div className="absolute inset-0 opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/India_map_en.svg/800px-India_map_en.svg.png')] bg-cover bg-center" style={{ filter: 'grayscale(1) brightness(1.1)' }} />
             
             {/* Mock Heatmap Blobs */}
             <div className="absolute inset-0">
               <div className="absolute top-[30%] left-[40%] w-64 h-64 rounded-full bg-red-500/40 blur-3xl mix-blend-multiply" />
               <div className="absolute top-[45%] left-[50%] w-48 h-48 rounded-full bg-orange-500/40 blur-3xl mix-blend-multiply" />
               <div className="absolute top-[60%] left-[35%] w-72 h-72 rounded-full bg-yellow-400/40 blur-3xl mix-blend-multiply" />
               <div className="absolute top-[20%] left-[60%] w-32 h-32 rounded-full bg-green-500/40 blur-2xl mix-blend-multiply" />
               
               {/* Data Points */}
               <div className="absolute top-[35%] left-[45%] w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-md" />
               <div className="absolute top-[50%] left-[55%] w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-md" />
               <div className="absolute top-[65%] left-[40%] w-3 h-3 bg-yellow-500 rounded-full border-2 border-white shadow-md" />
               <div className="absolute top-[25%] left-[65%] w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md" />
               
               {/* Labels */}
               <div className="absolute top-[33%] left-[47%] text-xs font-bold text-gray-800 bg-white/80 px-1 rounded backdrop-blur-sm">Yelahanka</div>
               <div className="absolute top-[48%] left-[57%] text-xs font-bold text-gray-800 bg-white/80 px-1 rounded backdrop-blur-sm">Whitefield</div>
             </div>

             <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-gray-100 flex items-center shadow-sm">
               <span className="text-xs font-semibold text-gray-600 mr-3">Good</span>
               <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500" />
               <span className="text-xs font-semibold text-gray-600 ml-3">Hazardous</span>
             </div>
          </div>

          {/* Right Sidebar Charts */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Chart 1 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex-1 flex flex-col justify-center">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Air Quality (AQI)</h4>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-4xl font-bold text-red-500 mb-1">178</div>
                  <div className="text-sm font-semibold text-gray-600 mb-2">Unhealthy</div>
                  <div className="text-xs font-medium text-green-500 flex items-center gap-1">↑ 12 vs yesterday</div>
                </div>
                {/* Mock SVG Line Chart */}
                <svg width="120" height="60" viewBox="0 0 120 60" className="overflow-visible">
                  <path d="M0,50 L20,40 L40,45 L60,25 L80,35 L100,10 L120,15" fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M0,60 L0,50 L20,40 L40,45 L60,25 L80,35 L100,10 L120,15 L120,60 Z" fill="url(#grad-red)" opacity="0.1" />
                  <defs>
                    <linearGradient id="grad-red" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity="1" />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Chart 2 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex-1 flex flex-col justify-center">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">PM2.5 (µg/m³)</h4>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">96</div>
                  <div className="text-xs font-medium text-red-500 flex items-center gap-1">↑ 15%</div>
                </div>
                {/* Mock SVG Line Chart */}
                <svg width="120" height="60" viewBox="0 0 120 60" className="overflow-visible">
                  <path d="M0,45 L20,50 L40,30 L60,35 L80,15 L100,20 L120,5" fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M0,60 L0,45 L20,50 L40,30 L60,35 L80,15 L100,20 L120,5 L120,60 Z" fill="url(#grad-blue)" opacity="0.1" />
                  <defs>
                    <linearGradient id="grad-blue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Chart 3 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex-1 flex flex-col justify-center">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">PM10 (µg/m³)</h4>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">152</div>
                  <div className="text-xs font-medium text-green-500 flex items-center gap-1">↑ 10%</div>
                </div>
                {/* Mock SVG Line Chart */}
                <svg width="120" height="60" viewBox="0 0 120 60" className="overflow-visible">
                  <path d="M0,35 L20,40 L40,20 L60,30 L80,10 L100,25 L120,15" fill="none" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M0,60 L0,35 L20,40 L40,20 L60,30 L80,10 L100,25 L120,15 L120,60 Z" fill="url(#grad-rose)" opacity="0.1" />
                  <defs>
                    <linearGradient id="grad-rose" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F43F5E" stopOpacity="1" />
                      <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
