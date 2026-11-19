const EMBED_URL = 'https://maps.google.com/maps';
const DIRECTIONS_URL = 'https://www.google.com/maps/dir/';

function point(spot) {
  return `${spot.lat},${spot.lon}`;
}

export function placeMapUrl(place) {
  const params = new URLSearchParams({ q: point(place), z: 11, output: 'embed' });
  return `${EMBED_URL}?${params}`;
}

export function routeMapUrl(from, place) {
  const params = new URLSearchParams({ saddr: point(from), daddr: point(place), output: 'embed' });
  return `${EMBED_URL}?${params}`;
}

export function directionsUrl(place, from) {
  const params = new URLSearchParams({ api: 1, destination: point(place) });
  if (from) {
    params.set('origin', point(from));
  }
  return `${DIRECTIONS_URL}?${params}`;
}
