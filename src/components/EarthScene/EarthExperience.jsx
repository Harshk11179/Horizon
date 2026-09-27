import { Suspense } from 'react';
import HeroOverlay from '@components/Hero/HeroOverlay';
import LocationOverlay from '@components/LocationOverlay/LocationOverlay';
import DashboardShell from '@components/Dashboard/DashboardShell';
import FrameSequenceCanvas from './FrameSequenceCanvas';

function LoadingFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-void-950 z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-neon-blue/20 border-t-neon-blue animate-spin" />
        <span className="font-mono text-xs text-mist-dim tracking-widest uppercase">
          Initializing Environment
        </span>
      </div>
    </div>
  );
}

export default function EarthExperience() {
  return (
    <div className="relative w-full">
      {/* Fixed sequence layer — stays mounted and visible behind all DOM content */}
      <div className="fixed inset-0 z-0 bg-black">
        <FrameSequenceCanvas />
      </div>

      {/* DOM overlay layer — hero text, buttons, location overlay, and
          the Mission Control dashboard all render ABOVE the fixed sequence layer */}
      <div className="relative z-10">
        <Suspense fallback={<LoadingFallback />}>
          <HeroOverlay />
          <LocationOverlay />
          <DashboardShell />
        </Suspense>
      </div>
    </div>
  );
}
