export const RAIN_LIMIT = 60;
export const COLD_LIMIT = 12;

export function getVerdict(forecast) {
  if (typeof forecast.rainChance !== 'number' || typeof forecast.min !== 'number') {
    return null;
  }
  if (forecast.rainChance >= RAIN_LIMIT) {
    return { tone: 'rain', text: 'Rain likely, consider rescheduling' };
  }
  if (forecast.min < COLD_LIMIT) {
    return { tone: 'jacket', text: 'Bring a jacket' };
  }
  return { tone: 'good', text: 'Good to go' };
}
