import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore, SCENE_PHASE, DASHBOARD_VIEW } from '@hooks/useAppStore';
import MapView from './MapView';
import CitizenView from './CitizenView';
import ProfessionalView from './ProfessionalView';
import LoginView from './LoginView';

export default function DashboardShell() {
  const scenePhase = useAppStore((state) => state.scenePhase);
  const setScenePhase = useAppStore((state) => state.setScenePhase);
  const activeDashboardView = useAppStore((state) => state.activeDashboardView);
  const setActiveDashboardView = useAppStore((state) => state.setActiveDashboardView);
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);
  const setIsLoggedIn = useAppStore((state) => state.setIsLoggedIn);

  const isVisible = scenePhase === SCENE_PHASE.DASHBOARD;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] overflow-y-auto">
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <LoginView key="login" />
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            {/* Unified Top Bar */}
            <div className="h-16 bg-[#111827] text-white flex items-center justify-between px-6 shadow-md z-20 sticky top-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setScenePhase(SCENE_PHASE.HERO)}
                  className="text-xl font-bold flex items-center gap-3 hover:text-blue-400 transition-colors"
                >
                  <span className="text-2xl">≡</span> Horizon Dashboard
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveDashboardView(DASHBOARD_VIEW.MAP)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeDashboardView === DASHBOARD_VIEW.MAP
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Map View
                </button>
                <button
                  onClick={() => setActiveDashboardView(DASHBOARD_VIEW.CITIZEN)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeDashboardView === DASHBOARD_VIEW.CITIZEN
                      ? 'bg-[#10B981] text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : 'bg-[#10B981]/20 text-[#10B981] hover:bg-[#10B981]/80 hover:text-white'
                  }`}
                >
                  Citizen View
                </button>
                <button
                  onClick={() => setActiveDashboardView(DASHBOARD_VIEW.PROFESSIONAL)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeDashboardView === DASHBOARD_VIEW.PROFESSIONAL
                      ? 'bg-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                      : 'bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/80 hover:text-white'
                  }`}
                >
                  Professional View
                </button>
                <div className="w-px h-6 bg-white/20 mx-2" />
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setScenePhase(SCENE_PHASE.HERO);
                  }}
                  className="text-sm font-medium text-gray-400 hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Dashboard Content Area */}
            <div className="flex-1 bg-[#f8fafc]">
              <AnimatePresence mode="wait">
                {activeDashboardView === DASHBOARD_VIEW.MAP && <MapView key="map" />}
                {activeDashboardView === DASHBOARD_VIEW.CITIZEN && <CitizenView key="citizen" />}
                {activeDashboardView === DASHBOARD_VIEW.PROFESSIONAL && <ProfessionalView key="professional" />}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
