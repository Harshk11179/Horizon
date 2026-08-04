/**
 * environmentalDataService.js
 *
 * SINGLE SEAM between the UI and its data source.
 *
 * Right now every function below resolves from local placeholder JSON.
 * When the FastAPI backend (see project abstract, Phase 2-4) is ready,
 * each function body is replaced with a `fetch(...)` call — the function
 * SIGNATURES and RETURN SHAPES are designed to match the planned REST
 * endpoints already, so no component that calls these functions should
 * need to change.
 *
 * Planned real endpoints (for reference when wiring this up later):
 *   GET  /api/locations                        -> getAllLocations()
 *   GET  /api/locations/:id                     -> getLocation(id)
 *   GET  /api/locations/:id/trend?range=12m      -> getTrendData(id, range)
 *   GET  /api/citizen/suggestions?location=:id  -> getSuggestions(id)
 *   GET  /api/professional/project-types        -> getProjectTypes()
 *   POST /api/professional/assess               -> getProfessionalAssessment(locationId, projectTypeId)
 *
 * Every exported function is async and returns a Promise, even though the
 * placeholder implementations are synchronous underneath. This is
 * deliberate: it means calling code already handles the pending/loading
 * state a real network call will introduce, so swapping the
 * implementation later doesn't also require rewriting every consumer's
 * control flow from sync to async.
 */

import locationsData from '@data/locations.json';
import trendsData from '@data/trends.json';
import suggestionsData from '@data/suggestions.json';
import projectTypesData from '@data/projectTypes.json';

// Simulated network latency. Kept small and consistent so loading-state
// UI (skeletons, fade-ins) gets exercised during development without
// making the app feel sluggish. Set to 0 to disable during rapid iteration.
const SIMULATED_LATENCY_MS = 220;

function resolveAfterLatency(value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), SIMULATED_LATENCY_MS);
  });
}

/**
 * Returns all locations as an array (object values, not the id-keyed map).
 * Matches the shape a `GET /api/locations` list endpoint would return.
 */
export async function getAllLocations() {
  return resolveAfterLatency(Object.values(locationsData));
}

/**
 * Returns a single location's full record by id, or null if not found.
 * @param {string} locationId - e.g. "india"
 */
export async function getLocation(locationId) {
  const location = locationsData[locationId] ?? null;
  return resolveAfterLatency(location);
}

/**
 * Returns just the environmental score + monthly change for a location.
 * Split out from getLocation() because the HealthScore gauge only needs
 * this slice, and a real backend may expose a lighter /score endpoint
 * separately from the full /locations/:id payload for that reason.
 */
export async function getEnvironmentalScore(locationId) {
  const location = locationsData[locationId];
  if (!location) return resolveAfterLatency(null);
  return resolveAfterLatency({
    score: location.environmentalScore,
    monthlyChange: location.scoreChangeMonthly,
  });
}

/**
 * Returns the indicator set (air quality, water stress, etc.) for a location.
 */
export async function getIndicators(locationId) {
  const location = locationsData[locationId];
  return resolveAfterLatency(location?.indicators ?? null);
}

/**
 * Returns 12-month trend data for a location.
 * @param {string} locationId
 * @param {string} range - reserved for future use (e.g. "12m", "5y");
 *   placeholder data only has 12 months, so this param is currently
 *   accepted but not used to filter. Kept in the signature now so the
 *   real endpoint's query param doesn't require a call-site change later.
 */
export async function getTrendData(locationId, range = '12m') {
  void range; // intentionally unused until real historical ranges exist
  const trend = trendsData[locationId] ?? [];
  return resolveAfterLatency(trend);
}

/**
 * Returns personalized suggestion cards for a location, derived from
 * whichever of its indicators are in "moderate" or worse status.
 * This mirrors what the FastAPI backend's scoring engine is expected to
 * do server-side eventually — the placeholder replicates that selection
 * logic client-side so the citizen view's behavior doesn't change when
 * the real endpoint takes over the selection itself.
 */
export async function getSuggestions(locationId) {
  const location = locationsData[locationId];
  if (!location) return resolveAfterLatency([]);

  const concerningIndicators = Object.entries(location.indicators)
    .filter(([, data]) => data.status && data.status !== 'good' && data.status !== 'low')
    .map(([key]) => key);

  const relevant = concerningIndicators
    .flatMap((key) => suggestionsData[key] ?? [])
    .slice(0, 6);

  // Fallback: if a location has no concerning indicators, still show
  // something rather than an empty state.
  const result = relevant.length > 0 ? relevant : suggestionsData.airQuality.slice(0, 3);

  return resolveAfterLatency(result);
}

/**
 * Returns the list of selectable project types for the professional view.
 */
export async function getProjectTypes() {
  return resolveAfterLatency(projectTypesData.projectTypes);
}

/**
 * The professional pre-screening "assessment". Combines the selected
 * location's real indicators with the project-type template's
 * land-condition / biodiversity-sensitivity placeholder values, and
 * returns a single unified object matching what a POST to
 * /api/professional/assess would return.
 *
 * @param {string} locationId
 * @param {string} projectTypeId
 */
export async function getProfessionalAssessment(locationId, projectTypeId) {
  const location = locationsData[locationId];
  const template = projectTypesData.recommendationTemplates[projectTypeId];

  if (!location || !template) {
    return resolveAfterLatency(null);
  }

  return resolveAfterLatency({
    locationId,
    locationName: location.name,
    projectTypeId,
    airQuality: location.indicators.airQuality,
    waterStress: location.indicators.waterStress,
    greenCover: location.indicators.greenCover,
    climateRisk: location.indicators.climateRisk,
    landCondition: template.landCondition,
    biodiversitySensitivity: template.biodiversitySensitivity,
    recommendation: template.recommendation,
  });
}
