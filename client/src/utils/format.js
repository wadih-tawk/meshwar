export const ACTIVITIES = [
  { value: 'hike', label: 'Hike' },
  { value: 'beach', label: 'Beach' },
  { value: 'ski', label: 'Ski' },
  { value: 'picnic', label: 'Picnic' },
  { value: 'city', label: 'City trip' },
  { value: 'other', label: 'Other' },
];

export function activityLabel(value) {
  const activity = ACTIVITIES.find(item => item.value === value);
  return activity ? activity.label : 'Other';
}

export function placeLabel(place) {
  if (!place.country) {
    return place.name;
  }
  return `${place.name}, ${place.country}`;
}

export function formatTemp(value) {
  return typeof value === 'number' ? `${Math.round(value)} °C` : '—';
}

export function formatRange(min, max) {
  if (typeof min !== 'number' || typeof max !== 'number') {
    return '—';
  }
  return `${Math.round(min)}–${Math.round(max)} °C`;
}

export function formatPercent(value) {
  return typeof value === 'number' ? `${Math.round(value)}%` : '—';
}

export function formatWind(value) {
  return typeof value === 'number' ? `${Math.round(value)} km/h` : '—';
}
