import { motion } from 'framer-motion';

export default function CitizenView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 max-w-7xl mx-auto min-h-[calc(100vh-64px)] bg-[#f8fafc]"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Environment, Simplified</h2>
          <p className="text-gray-500">Real-time insights for a cleaner tomorrow 🌍</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Your Location</div>
            <div className="text-sm font-semibold text-gray-800">Bengaluru, Karnataka</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xl">📍</div>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
        {[
          { title: 'Air Quality', icon: '☁️', value: 'Unhealthy', sub: 'AQI 178', color: 'text-red-500', action: 'Avoid outdoor activities' },
          { title: 'Water Quality', icon: '💧', value: 'Needs Attention', sub: '42% Safe', color: 'text-orange-500', action: 'Do not waste water' },
          { title: 'Waste Status', icon: '🗑️', value: 'High', sub: 'Collection Delayed', color: 'text-red-500', action: 'Segregate your waste' },
          { title: 'Green Cover', icon: '🌱', value: 'Moderate', sub: '24.6%', color: 'text-green-500', action: 'Let\'s grow more trees' },
          { title: 'Noise Level', icon: '🔊', value: 'High', sub: '78 dB', color: 'text-red-500', action: 'Reduce loud noises' },
        ].map((card, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300 cursor-default"
          >
            <div className="text-4xl mb-4 bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center">{card.icon}</div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">{card.title}</h3>
            <div className={`text-lg font-bold ${card.color} mb-1`}>{card.value}</div>
            <div className="text-sm font-semibold text-gray-800 mb-6">{card.sub}</div>
            <div className="mt-auto pt-4 border-t border-gray-100 w-full text-xs font-medium text-gray-500">{card.action}</div>
          </motion.div>
        ))}
      </div>

      {/* Action Section */}
      <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 text-center mb-8">What Can You Do Today?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">What to Collect?</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><span className="text-gray-300">•</span> Plastic Bottles</li>
              <li className="flex items-center gap-2"><span className="text-gray-300">•</span> E-Waste</li>
              <li className="flex items-center gap-2"><span className="text-gray-300">•</span> Paper</li>
              <li className="flex items-center gap-2"><span className="text-gray-300">•</span> Clothes</li>
            </ul>
            <button className="text-blue-500 text-sm font-medium hover:underline mt-2">Know more →</button>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Where to Contribute?</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><span className="text-gray-300">•</span> Local Collection Drives</li>
              <li className="flex items-center gap-2"><span className="text-gray-300">•</span> Recycling Centers</li>
              <li className="flex items-center gap-2"><span className="text-gray-300">•</span> Donation Points</li>
              <li className="flex items-center gap-2"><span className="text-gray-300">•</span> Tree Plantation Drives</li>
            </ul>
            <button className="text-blue-500 text-sm font-medium hover:underline mt-2">Find Locations →</button>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Reduce Your Impact 🌲</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded text-green-500 focus:ring-green-500" defaultChecked />
                Use Public Transport
              </li>
              <li className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded text-green-500 focus:ring-green-500" defaultChecked />
                Save Water
              </li>
              <li className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded text-green-500 focus:ring-green-500" />
                Avoid Single-use Plastic
              </li>
              <li className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded text-green-500 focus:ring-green-500" />
                Plant Trees
              </li>
            </ul>
            <button className="text-blue-500 text-sm font-medium hover:underline mt-2">Pledge Now →</button>
          </div>

          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex flex-col justify-center text-center">
            <h4 className="font-semibold text-gray-900 mb-2">Stay Informed</h4>
            <p className="text-sm text-gray-500 mb-6">Get alerts & updates on your environment</p>
            <button className="w-full py-3 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center justify-center gap-2">
              <span className="text-lg">🔔</span> Enable Alerts
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
