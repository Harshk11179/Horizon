import SectionPlanetaryHealth from './SectionPlanetaryHealth';
import SectionPlanetaryBoundaries from './SectionPlanetaryBoundaries';
import SectionRiskPrediction from './SectionRiskPrediction';
import SectionSatelliteChange from './SectionSatelliteChange';
import SectionUserTypes from './SectionUserTypes';
import SectionAIEngine from './SectionAIEngine';
import SectionLocationComparison from './SectionLocationComparison';
import SectionReport from './SectionReport';
import SectionFinalCTA from './SectionFinalCTA';
import Footer from '@components/Footer/Footer';

/**
 * LandingPage
 *
 * Composes all scroll sections that appear after the hero's 300vh spacer.
 * Rendered inside HeroOverlay after the spacer div — the fixed 3D Earth
 * canvas sits behind this at z-0. Each section has its own background
 * gradient so the Earth is gradually hidden as the user scrolls into the
 * content, avoiding the jarring "globe peeking through content" problem.
 *
 * No additional libraries required — framer-motion (already in bundle)
 * handles all scroll-triggered animations via useInView.
 */
export default function LandingPage() {
  return (
    <div className="relative w-full" aria-label="Horizon landing page content">
      <SectionPlanetaryHealth />
      <SectionPlanetaryBoundaries />
      <SectionUserTypes />
      <SectionRiskPrediction />
      <SectionSatelliteChange />
      <SectionAIEngine />
      <SectionLocationComparison />
      <SectionReport />
      <SectionFinalCTA />
      <Footer />
    </div>
  );
}
