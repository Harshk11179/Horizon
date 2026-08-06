const STORAGE_KEY = 'horizon-adopted-actions';

/**
 * Each adopted action is worth 10 impact points. Levels unlock at
 * multiples of 50 points (so every 5 actions advances a level).
 */
const POINTS_PER_ACTION = 10;
const POINTS_PER_LEVEL = 50;

export function getAdoptedActions() {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(STORAGE_KEY)) ?? []);
  } catch {
    return new Set();
  }
}

export function toggleAction(actionId) {
  const adopted = getAdoptedActions();
  if (adopted.has(actionId)) {
    adopted.delete(actionId);
  } else {
    adopted.add(actionId);
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...adopted]));
  } catch {
    // Storage unavailable (private mode, quota exceeded); the Set still
    // updates in-memory so the session's UI stays consistent, it just
    // won't survive a reload.
  }
  return adopted;
}

export function computeProgress(adoptedCount) {
  const points = adoptedCount * POINTS_PER_ACTION;
  const level = Math.floor(points / POINTS_PER_LEVEL) + 1;
  const pointsIntoCurrentLevel = points % POINTS_PER_LEVEL;
  const pointsToNextLevel = POINTS_PER_LEVEL - pointsIntoCurrentLevel;
  return { points, level, pointsIntoCurrentLevel, pointsToNextLevel };
}
