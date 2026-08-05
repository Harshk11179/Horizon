import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore, SCENE_PHASE, DASHBOARD_VIEW } from '@hooks/useAppStore';
import MissionControlDashboard from './MissionControlDashboard';
import ComparisonView from './ComparisonView';
import RankingsView from './RankingsView';
import CitizenView from '@components/Citizen/CitizenView';
import ProfessionalView from '@components/Professional/ProfessionalView';
import Footer from '@components/Footer/Footer';

const VIEW_TABS = [
  { id: DASHBOARD_VIEW.MISSION_CONTROL, label: 'Mission Control' },
  { id: DASHBOARD_VIEW.CITIZEN, label: 'Citizen' },
  { id: DASHBOARD_VIEW.PROFESSIONAL, label: 'Professional' },
  { id: DASHBOARD_VIEW.COMPARE, label: 'Compare' },
  { id: DASHBOARD_VIEW.RANKINGS, label: 'Rankings' },
];

/**
 * DashboardShell
 *
 * Only renders (returns non-null) once scenePhase is DASHBOARD — this
 * is the phase Navbar's "Dashboard"/"Citizen"/"Professional" links and
 * HeroOverlay's "Enter Dashboard" button set. Rendered as a sibling to
 * HeroOverlay inside EarthExperience's DOM layer rather than replacing
 * it, so the transition IN to the dashboard can be an overlay fade
 * rather than a hard swap (see the brief: "no page reloads... 
 * everything should animate smoothly").
 *
 * The 3D Earth scene keeps rendering behind this — it's just visually
 * dimmed via the semi-opaque background here, which is what satisfies
 * "the globe remains visible while navigating" even once inside
 * Mission Control, not just during the marker-focus phase.
 */
export default function DashboardShell() {
  const scenePhase = useAppStore((state) => state.scenePhase);
  const activeDashboardView = useAppStore((state) => state.activeDashboardView);
  const setActiveDashboardView = useAppStore((state) => state.setActiveDashboardView);

  const isVisible = scenePhase === SCENE_PHASE.DASHBOARD;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-20 bg-void-950/85 backdrop-blur-sm overflow-y-auto"
        >
          {/* Sub-nav tabs, fixed beneath the main Navbar */}
          <div className="fixed top-16 left-0 right-0 z-10 flex justify-center pt-4 pointer-events-none">
            <div className="glass-panel-strong px-1.5 py-1.5 flex items-center gap-1 pointer-events-auto">
              {VIEW_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDashboardView(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-display tracking-wide transition-colors duration-200 ${
                    activeDashboardView === tab.id
                      ? 'bg-neon-blue/15 text-mist'
                      : 'text-mist-dim hover:text-mist'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeDashboardView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              {activeDashboardView === DASHBOARD_VIEW.MISSION_CONTROL && <MissionControlDashboard />}
              {activeDashboardView === DASHBOARD_VIEW.CITIZEN && <CitizenView />}
              {activeDashboardView === DASHBOARD_VIEW.PROFESSIONAL && <ProfessionalView />}
              {activeDashboardView === DASHBOARD_VIEW.COMPARE && <ComparisonView />}
              {activeDashboardView === DASHBOARD_VIEW.RANKINGS && <RankingsView />}
            </motion.div>
          </AnimatePresence>

          <Footer />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
