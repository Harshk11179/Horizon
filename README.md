# EcoSentinel — Frontend

An AI-powered environmental intelligence platform presented as an
immersive, cinematic 3D experience: a real-time rotating Earth in deep
space, six clickable country markers with holographic environmental
readouts, and a Mission Control dashboard with dedicated Citizen and
Professional views.

This is the **frontend only**. It runs entirely on local placeholder
data and is architected so a FastAPI backend (see the project abstract)
can be connected later without any structural rewrite — see
[Future FastAPI Integration Points](#future-fastapi-integration-points)
below.

---

## Project Overview

EcoSentinel bridges two audiences on one platform:

- **Citizens** get an easy-to-read environmental health score for their
  location, monthly trend context, and personalized sustainability
  suggestions.
- **Professionals** (civil engineers, developers, planners) get an
  early pre-screening assessment — air quality, water stress, green
  cover, land condition, biodiversity sensitivity, climate risk — for a
  chosen location and project type, before the formal Environmental
  Impact Assessment process begins.

The landing experience is a full-screen, auto-orbiting 3D Earth with a
moving day/night cycle, independently-rotating clouds, aurora, and a
starfield. Scrolling zooms the camera toward the planet; clicking one
of six country markers (India, USA, Brazil, Germany, Australia, Japan)
flies the camera to that location and raises a holographic overlay of
its environmental indicators. From there, the user can enter the full
Mission Control dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| 3D rendering | Three.js, React Three Fiber, drei |
| Postprocessing | `@react-three/postprocessing` (Bloom, Vignette) |
| Animation | Framer Motion, native SVG/CSS animation |
| Styling | Tailwind CSS (custom design tokens) |
| State | Zustand (thin, cross-cutting state only) |
| Routing | React Router (declarative mode) |
| Fonts | Space Grotesk (display), Inter (body), JetBrains Mono (data) |

No backend, no authentication, no database, no external API calls, no
CMS — all data is local JSON, served through an async service layer
that simulates network latency.

---

## Installation

### Requirements
See [`ENVIRONMENT.md`](./ENVIRONMENT.md) for exact version requirements
and setup notes. Short version: Node.js 18+ and npm.

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
# → served at http://localhost:5173

# 3. Build for production
npm run build
# → output written to /dist

# 4. Preview the production build locally (optional)
npm run preview
```

The project runs immediately after `npm install && npm run dev` — no
environment variables, no API keys, no additional setup required.

### Regenerating textures (optional)

The four Earth surface textures (`earth-day.jpg`, `earth-night.png`,
`earth-clouds.png`, `earth-normal.jpg`) are pre-generated and already
committed under `src/assets/textures/`. They were produced by a
build-time script, not fetched from any external source — see
[Known Limitations](./FINAL_AUDIT.md#known-limitations) for why. To
regenerate them (e.g. after modifying the generator):

```bash
node scripts/generateTextures.js
```

This requires the `canvas` and `simplex-noise` devDependencies, already
listed in `package.json`. The script is not part of the build or dev
pipeline — it's a one-time asset-generation tool.

---

## Folder Structure

```
ecosentinel/
├── README.md
├── FINAL_AUDIT.md
├── ENVIRONMENT.md
├── DEPENDENCY_NOTES.md          # Why specific dependency versions were pinned
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── scripts/
│   └── generateTextures.js      # Build-time procedural texture generator
└── src/
    ├── main.jsx                 # React entry point
    ├── App.jsx                  # Scroll container, cursor glow, route shell
    ├── styles/
    │   └── index.css            # Tailwind directives, glass/glow utility classes
    ├── assets/
    │   └── textures/            # Generated Earth surface maps
    ├── data/                    # Placeholder JSON (locations, trends, suggestions, project types)
    ├── services/
    │   └── environmentalDataService.js   # THE seam — see Architecture below
    ├── hooks/
    │   ├── useAppStore.js       # Zustand store — scene phase, selection, scroll progress
    │   ├── usePointerPosition.js
    │   └── useScrollProgress.js
    ├── utils/
    │   └── geoToVector3.js      # Lat/lng → 3D sphere position math
    └── components/
        ├── EarthScene/          # EarthMesh, CloudLayer, CameraRig, AuroraEffect, shader materials
        ├── ParticleSystem/      # Starfield, SpaceDust, Nebula
        ├── GlobeMarkers/        # Clickable markers, selection ring effect
        ├── Hero/                # Landing hero, intro sequence, scroll parallax
        ├── LocationOverlay/     # Holographic indicator panel on marker selection
        ├── Navbar/
        ├── Dashboard/           # MissionControlDashboard, LocationSelector, DashboardShell
        ├── Citizen/
        ├── Professional/
        ├── HealthScore/         # The signature tick-mark gauge
        ├── Timeline/
        ├── HolographicPanels/   # Shared glass-panel primitive
        └── Footer/
```

---

## Architecture

### The data seam

Every piece of UI-facing data flows through **one file**:
`src/services/environmentalDataService.js`. No component imports the
JSON files in `src/data/` directly for display purposes — they call one
of eight documented async functions instead, each shaped to match a
planned real REST endpoint (see below).

This is deliberate. Every function is `async` and returns a `Promise`,
with a small simulated network delay, even though the current
implementation is just reading a local object. That means every
component that calls these functions **already handles a loading
state** — the loading skeletons and fade-ins in the UI are exercising
real code paths, not decoration. When the FastAPI backend is ready,
swapping a function body for a `fetch()` call does not require
touching any component that calls it.

Two narrow exceptions import location data directly rather than
through the service layer: `CameraRig.jsx` (the fly-to camera needs a
location's lat/lng synchronously, with no acceptable loading state
mid-flight) and `GlobeMarkers.jsx`/`LocationSelector.jsx` (positioning
markers and building a location list are synchronous geometry/UI
concerns, not data-fetching concerns). Each is commented in-file
explaining why.

### Scene state, not page state

The core experience — hero → scroll-zoom → marker-focus → dashboard —
is **not** driven by client-side routing. It's a single state machine
(`useAppStore.js`'s `scenePhase`) that every relevant component reads.
This is what makes "no page reloads, everything animates smoothly" true
structurally rather than something bolted on: there's only ever one
`scenePhase` value, and every visual layer (3D camera, DOM overlays,
dashboard) reacts to the same source of truth.

### Camera ownership

`CameraRig.jsx` is the **only** component that writes to
`camera.position` each frame. Auto-orbit, mouse parallax,
scroll-driven zoom, and marker fly-to are all real requirements from
the brief, and if each were a separate `useFrame` hook in a separate
component, they would fight over control of the camera on every frame
— whichever ran last would silently win, producing visible jitter.
Centralizing camera ownership in one component, with `scenePhase`
choosing which behavior is authoritative each frame, avoids that
entirely.

### Shader architecture

Three custom shader materials handle the Earth's visual layers:
`EarthMaterial.js` (day/night blend, city lights, ocean specular,
cloud shadow), `AtmosphereMaterial.js` (Fresnel rim glow), and
`CloudsMaterial.js` (independently-lit cloud alpha layer). All three
read from a single shared sun-direction value computed once in
`EarthMesh.jsx` and passed down, so the shader-computed lighting and
the scene's real `DirectionalLight` never disagree about where the sun
is.

### Design tokens

Colors, type, and the signature tick-mark health-score gauge are
defined once in `tailwind.config.js` and `HealthScoreGauge.jsx`, reused
consistently across Mission Control, Citizen, and Professional views
via the shared `Panel.jsx` primitive — rather than each view
reimplementing its own card/glow/hover styling.

---

## Future FastAPI Integration Points

Every function in `src/services/environmentalDataService.js` maps to a
planned real endpoint, documented in that file's header comment:

```
GET  /api/locations                          -> getAllLocations()
GET  /api/locations/:id                       -> getLocation(id)
GET  /api/locations/:id/score                 -> getEnvironmentalScore(id)
GET  /api/locations/:id/indicators            -> getIndicators(id)
GET  /api/locations/:id/trend?range=12m       -> getTrendData(id, range)
GET  /api/citizen/suggestions?location=:id    -> getSuggestions(id)
GET  /api/professional/project-types          -> getProjectTypes()
POST /api/professional/assess                 -> getProfessionalAssessment(locationId, projectTypeId)
```

**To connect the real backend:**

1. Replace each function body in `environmentalDataService.js` with a
   `fetch()` (or your preferred client) call to the matching endpoint.
2. Remove the `resolveAfterLatency()` simulated-delay wrapper — real
   network latency replaces it.
3. No component changes should be required, since every consumer
   already awaits these functions and already renders a loading state
   while they resolve.
4. `src/data/*.json` becomes unused and can be deleted once the real
   backend is live — nothing else in the app imports it for display
   purposes.

For full requirement-by-requirement status, see
[`FINAL_AUDIT.md`](./FINAL_AUDIT.md). For dependency version reasoning,
see [`DEPENDENCY_NOTES.md`](./DEPENDENCY_NOTES.md). For environment
setup details, see [`ENVIRONMENT.md`](./ENVIRONMENT.md).
