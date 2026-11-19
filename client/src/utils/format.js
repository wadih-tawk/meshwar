export const ACTIVITIES = [
  { value: 'hike', label: 'Hike', icon: '🥾' },
  { value: 'beach', label: 'Beach', icon: '🏖️' },
  { value: 'ski', label: 'Ski', icon: '⛷️' },
  { value: 'picnic', label: 'Picnic', icon: '🧺' },
  { value: 'city', label: 'City trip', icon: '🏙️' },
  { value: 'other', label: 'Other', icon: '📍' },
];

function findActivity(value) {
  const activity = ACTIVITIES.find(item => item.value === value);
  return activity ? activity : ACTIVITIES[ACTIVITIES.length - 1];
}

export function activityLabel(value) {
  return findActivity(value).label;
}

export function activityIcon(value) {
  return findActivity(value).icon;
}

export function activityPhoto(value) {
  return `/photos/${findActivity(value).value}.jpg`;
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

export function describeWeather(code) {
  if (typeof code !== 'number') {
    return null;
  }
  if (code === 0) {
    return { icon: '☀️', label: 'Clear sky' };
  }
  if (code <= 2) {
    return { icon: '⛅', label: 'Partly cloudy' };
  }
  if (code === 3) {
    return { icon: '☁️', label: 'Overcast' };
  }
  if (code <= 48) {
    return { icon: '🌫️', label: 'Fog' };
  }
  if (code <= 57) {
    return { icon: '🌦️', label: 'Drizzle' };
  }
  if (code <= 67) {
    return { icon: '🌧️', label: 'Rain' };
  }
  if (code <= 77) {
    return { icon: '🌨️', label: 'Snow' };
  }
  if (code <= 82) {
    return { icon: '🌦️', label: 'Rain showers' };
  }
  if (code <= 86) {
    return { icon: '🌨️', label: 'Snow showers' };
  }
  return { icon: '⛈️', label: 'Thunderstorm' };
}
