const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const forecasts = {};
const DAILY_FIELDS = 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max';

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
  const inLebanon = new URLSearchParams({ name, count: 4, language: 'en', format: 'json', countryCode: 'LB' });
  const everywhere = new URLSearchParams({ name, count: 5, language: 'en', format: 'json' });
  const [local, world] = await Promise.all([getJSON(`${GEO_URL}?${inLebanon}`), getJSON(`${GEO_URL}?${everywhere}`)]);
  const all = [...(local.results ?? []), ...(world.results ?? [])];
  const unique = all.filter((place, index) => all.findIndex(other => other.id === place.id) === index);
  return unique.slice(0, 7).map(place => ({
    id: place.id,
    name: place.name,
    region: place.admin1 ?? '',
    country: place.country ?? '',
    lat: place.latitude,
    lon: place.longitude,
  }));
}

export async function getForecast(lat, lon, date) {
  const key = `${lat}|${lon}|${date}`;
  if (key in forecasts) {
    return forecasts[key];
  }
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    daily: DAILY_FIELDS,
    timezone: 'auto',
    start_date: date,
    end_date: date,
  });
  const data = await getJSON(`${FORECAST_URL}?${params}`);
  const daily = data.daily;
  forecasts[key] = {
    max: daily.temperature_2m_max[0],
    min: daily.temperature_2m_min[0],
    rainChance: daily.precipitation_probability_max[0],
    wind: daily.wind_speed_10m_max[0],
    code: daily.weather_code[0],
  };
  return forecasts[key];
}
