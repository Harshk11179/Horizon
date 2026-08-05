import { create } from 'zustand';

/**
 * useAppStore
 *
 * Deliberately thin. This holds ONLY state that needs to be shared
 * across parts of the tree that aren't parent/child — the Earth scene,
 * the location overlay, and the dashboard all need to know which
 * location is selected, but they don't share a direct component
 * relationship in the tree the prompt's own architecture defines.
 *
 * Everything else (hover state on a single card, a form field's value,
 * a panel's open/closed state) stays as local useState in the component
 * that owns it. Not everything belongs in global state.
 */

export const SCENE_PHASE = {
  INTRO: 'intro', // fade-in-from-black sequence, not yet interactive
  HERO: 'hero', // full-screen Earth, hero text visible, camera auto-orbiting
  SCROLLING: 'scrolling', // user has begun scrolling, camera zooming toward Earth
  LOCATION_FOCUS: 'location_focus', // a marker was clicked, camera flying to it
  DASHBOARD: 'dashboard', // user has entered Mission Control
};

export const DASHBOARD_VIEW = {
  MISSION_CONTROL: 'mission_control',
  CITIZEN: 'citizen',
  PROFESSIONAL: 'professional',
  COMPARE: 'compare',
};

export const useAppStore = create((set) => ({
  // --- Scene / camera phase ---
  scenePhase: SCENE_PHASE.INTRO,
  setScenePhase: (phase) => set({ scenePhase: phase }),

  // --- Selected location (drives GlobeMarkers highlight, LocationOverlay,
  //     and pre-fills the professional/citizen views on entry) ---
  selectedLocationId: null,
  // Selecting a location from the globe triggers the fly-to
  // (LOCATION_FOCUS); selecting from within the dashboard keeps the
  // dashboard open and just swaps its data — otherwise the dashboard's
  // own LocationSelector would eject the user back to the globe.
  setSelectedLocationId: (id) =>
    set((state) => ({
      selectedLocationId: id,
      scenePhase:
        state.scenePhase === SCENE_PHASE.DASHBOARD
          ? state.scenePhase
          : id
            ? SCENE_PHASE.LOCATION_FOCUS
            : SCENE_PHASE.HERO,
    })),
  clearSelectedLocation: () =>
    set({ selectedLocationId: null, scenePhase: SCENE_PHASE.HERO }),

  // --- Active dashboard sub-view, once inside Mission Control ---
  activeDashboardView: DASHBOARD_VIEW.MISSION_CONTROL,
  setActiveDashboardView: (view) => set({ activeDashboardView: view }),

  // --- Global scroll progress (0-1), read by EarthScene to drive the
  //     camera-fly-toward-Earth interpolation described in the brief.
  //     Written by the scroll-tracking hook, read by the 3D scene —
  //     this is the clearest case of state needing to cross from a DOM
  //     concern into a Three.js concern, which is why it lives here
  //     rather than as prop-drilled state.
  scrollProgress: 0,
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
}));
