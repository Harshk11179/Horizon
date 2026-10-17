import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const COMMUNITY_INITIATIVES = [
  {
    id: 1,
    category: 'Volunteer',
    title: 'Weekend Tree Plantation',
    organizer: 'Green Earth Foundation',
    location: 'City Outskirts (5km away)',
    description: 'Join our weekly drive to plant native saplings and restore local green cover. Equipment provided.',
    tags: ['Environment', 'Weekend'],
    icon: '🌱',
    color: '#10B981',
    bg: '#ECFDF5'
  },
  {
    id: 2,
    category: 'Donate',
    title: 'Old Clothes & Fabric Drive',
    organizer: 'Threads of Hope',
    location: 'Multiple Drop-off Points',
    description: 'Donate your gently used clothes or torn fabrics. We recycle textiles to prevent landfill overflow.',
    tags: ['Recycling', 'Social'],
    icon: '👕',
    color: '#8B5CF6',
    bg: '#F5F3FF'
  },
  {
    id: 3,
    category: 'Collect',
    title: 'Plastic Bottle Exchange',
    organizer: 'EcoRewards City',
    location: 'Downtown Community Center',
    description: 'Collect single-use plastics over the month. Drop them off on the last Sunday for community credits.',
    tags: ['Plastic Free', 'Rewards'],
    icon: '♻️',
    color: '#3B82F6',
    bg: '#EFF6FF'
  },
  {
    id: 4,
    category: 'Join',
    title: 'Sustainable Citizens Forum',
    organizer: 'Local Gov & NGOs',
    location: 'Online / Townhall',
    description: 'A monthly meetup to discuss civic issues, propose green policies, and track local environmental metrics.',
    tags: ['Advocacy', 'Civic'],
    icon: '🤝',
    color: '#F59E0B',
    bg: '#FFFBEB'
  }
];

const ACTIONABLE_INSIGHTS = [
  { text: 'Start a home compost bin for kitchen waste', impact: 'High' },
  { text: 'Switch to public transport twice a week', impact: 'Medium' },
  { text: 'Install water-saving aerators on taps', impact: 'High' },
  { text: 'Buy seasonal, locally grown produce', impact: 'Medium' }
];

export default function CommunityActionsModal({ isOpen, onClose, stateName }) {
  const [activeTab, setActiveTab] = useState('initiatives');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[100] bg-[#f8fafc] overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Make an Impact in {stateName}</h1>
            <p className="text-sm text-gray-500">Discover local communities and take action today.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Area */}
          <div className="flex-[2]">
            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
              <button
                className={`pb-3 px-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'initiatives' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                onClick={() => setActiveTab('initiatives')}
              >
                Local Initiatives
              </button>
              <button
                className={`pb-3 px-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'communities' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                onClick={() => setActiveTab('communities')}
              >
                NGOs & Communities
              </button>
            </div>

            {/* Initiatives Grid */}
            {activeTab === 'initiatives' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {COMMUNITY_INITIATIVES.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gray-50 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110" style={{ backgroundImage: `linear-gradient(to bottom left, ${item.bg}, transparent)` }} />
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: item.bg, color: item.color }}>
                        {item.icon}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ backgroundColor: item.bg, color: item.color }}>
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 font-medium mb-3">By {item.organizer} • {item.location}</p>
                    <p className="text-sm text-gray-600 mb-5 leading-relaxed">{item.description}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex gap-2">
                        {item.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-transform hover:-translate-y-0.5 shadow-sm" style={{ backgroundColor: item.color }}>
                        Get Involved
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'communities' && (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-100 border-dashed text-gray-500">
                <span className="text-4xl mb-3">🌍</span>
                <p>Discovering verified communities nearby...</p>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="flex-1 space-y-6">
            
            {/* Impact Dashboard */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="font-bold text-lg mb-2">Your Citizen Impact</h3>
              <p className="text-sm text-blue-100 mb-6">Track your sustainable contributions this month.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">12 kg</div>
                  <div className="text-xs text-blue-100">CO₂ Saved</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">4</div>
                  <div className="text-xs text-blue-100">Events Joined</div>
                </div>
              </div>
              <button className="w-full mt-5 py-2.5 bg-white text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-50 transition-colors">
                View Full Profile
              </button>
            </div>

            {/* Actionable Insights */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>💡</span> Actionable Insights
              </h3>
              <div className="space-y-4">
                {ACTIONABLE_INSIGHTS.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5 group-hover:border-green-500 transition-colors" />
                    <div>
                      <p className="text-sm text-gray-700 font-medium group-hover:text-gray-900">{insight.text}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${insight.impact === 'High' ? 'text-green-600' : 'text-blue-600'}`}>
                        {insight.impact} Impact
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
