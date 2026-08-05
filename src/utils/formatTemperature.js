/**
 * All temperature data is stored in °C (the JSON's canonical unit);
 * conversion to the user's preferred display unit happens only at
 * render time, so no component ever mutates or double-converts data.
 */
export function formatTemperature(celsiusValue, unit) {
  if (unit === 'F') {
    return { value: Math.round((celsiusValue * 9) / 5 + 32), unit: '°F' };
  }
  return { value: celsiusValue, unit: '°C' };
}
