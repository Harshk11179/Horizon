import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, SCENE_PHASE } from '@hooks/useAppStore';

export default function LoginView() {
  const setIsLoggedIn = useAppStore((state) => state.setIsLoggedIn);
  const setScenePhase = useAppStore((state) => state.setScenePhase);
  const [isHovered, setIsHovered] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f3f4f6]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-green-400/20 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md p-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50"
      >
        <button
          onClick={() => setScenePhase(SCENE_PHASE.HERO)}
          className="absolute top-6 left-6 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-2"
        >
          ← Back to Earth
        </button>

        <div className="text-center mb-10 mt-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30"
          >
            <span className="text-3xl">🌍</span>
          </motion.div>
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-sm text-gray-500">Sign in to Horizon Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              defaultValue="admin@horizon.gov.in"
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              defaultValue="password123"
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
              required
            />
          </div>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            type="submit"
            className="w-full relative overflow-hidden py-3.5 rounded-xl text-white font-medium shadow-lg shadow-blue-500/30 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #10B981)',
            }}
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: '-100%' }}
              animate={{ x: isHovered ? '100%' : '-100%' }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
            <span className="relative z-10">Secure Login →</span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
