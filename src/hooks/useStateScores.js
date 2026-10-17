/**
 * useStateScores.js
 * Provides pre-computed state environmental scores (from calculation.py output)
 * plus helper functions for the map choropleth and dashboards.
 */
import stateScores from '@data/stateScores.json';

// Pick the most recent year row per state (highest coverage_pct wins, then latest year)
function getLatestScores() {
  const byState = {};
  for (const row of stateScores) {
    const key = row.state_code;
    const existing = byState[key];
    if (
      !existing ||
      row.coverage_pct > existing.coverage_pct ||
      (row.coverage_pct === existing.coverage_pct && row.year > existing.year)
    ) {
      byState[key] = row;
    }
  }
  return Object.values(byState);
}

export const latestStateScores = getLatestScores();

/** Quick lookup by state_code */
export const scoreByCode = Object.fromEntries(
  latestStateScores.map((s) => [s.state_code, s])
);

/** All raw rows (for year selectors etc.) */
export { stateScores };

/** Colour for a pressure score 0-100 */
export function pressureColour(score) {
  if (score == null) return '#9CA3AF';
  if (score <= 25) return '#2E7D32';
  if (score <= 50) return '#F9A825';
  if (score <= 75) return '#E65100';
  return '#B71C1C';
}

/** Risk band label */
export function riskBand(score) {
  if (score == null) return 'No data';
  if (score <= 25) return 'Low';
  if (score <= 50) return 'Moderate';
  if (score <= 75) return 'High';
  return 'Critical';
}
