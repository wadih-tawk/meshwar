const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';

async function getJSON(url) {
  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error('Could not reach the weather service.');
  }
  if (!res.ok) {
    throw new Error(`The weather service answered with an error (${res.status}).`);
  }
  return res.json();
}

export async function searchPlaces(name) {
  const params = new URLSearchParams({ name, count: 5, language: 'en', format: 'json' });
  const data = await getJSON(`${GEO_URL}?${params}`);
  return (data.results ?? []).map(place => ({
    id: place.id,
    name: place.name,
    region: place.admin1 ?? '',
    country: place.country ?? '',
    lat: place.latitude,
    lon: place.longitude,
  }));
}
