const WIKI_URL = 'https://en.wikipedia.org/w/api.php';
const NEAR = 0.3;
const summaries = {};
const SIGHTS = ['mosque', 'church', 'cathedral', 'monastery', 'temple', 'castle', 'citadel', 'fortress', 'tower', 'palace', 'mansion', 'museum', 'garden', 'park', 'reserve', 'forest', 'valley', 'mountain', 'lake', 'river', 'waterfall', 'beach', 'bay', 'island', 'cave', 'grotto', 'dam', 'ski', 'resort', 'square', 'market', 'souk', 'site', 'ruins', 'necropolis', 'monument', 'bridge', 'heritage'];

async function getJSON(url) {
  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error('Could not reach Wikipedia.');
  }
  if (!res.ok) {
    throw new Error(`Wikipedia answered with an error (${res.status}).`);
  }
  return res.json();
}

function wikiParams(extra) {
  return new URLSearchParams({ action: 'query', format: 'json', formatversion: 2, origin: '*', ...extra });
}

export function cleanExtract(text) {
  const start = text.indexOf('(');
  if (start === -1 || start > 40) {
    return text;
  }
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '(') {
      depth++;
    }
    if (text[i] === ')') {
      depth--;
    }
    if (depth === 0) {
      const before = text.slice(0, start).trimEnd();
      const after = text.slice(i + 1).trimStart();
      return after.startsWith(',') ? before + after : `${before} ${after}`;
    }
  }
  return text;
}

function toPlace(page) {
  return {
    title: page.title,
    description: page.description ?? '',
    extract: cleanExtract(page.extract ?? ''),
    photo: page.thumbnail ? page.thumbnail.source : null,
    url: `https://en.wikipedia.org/?curid=${page.pageid}`,
  };
}

export function isNear(page, lat, lon) {
  if (!page.coordinates) {
    return false;
  }
  const point = page.coordinates[0];
  return Math.abs(point.lat - lat) < NEAR && Math.abs(point.lon - lon) < NEAR;
}

export async function getPlaceSummary(place) {
  const key = `${place.name}|${place.country}|${place.lat}|${place.lon}`;
  if (key in summaries) {
    return summaries[key];
  }
  const params = wikiParams({
    generator: 'search',
    gsrsearch: `${place.name} ${place.country}`,
    gsrlimit: 1,
    prop: 'pageimages|extracts|description|coordinates',
    piprop: 'thumbnail',
    pithumbsize: 960,
    exintro: 1,
    explaintext: 1,
    exsentences: 2,
  });
  const data = await getJSON(`${WIKI_URL}?${params}`);
  const pages = data.query ? data.query.pages : [];
  const summary = pages.length > 0 && isNear(pages[0], place.lat, place.lon) ? toPlace(pages[0]) : null;
  summaries[key] = summary;
  return summary;
}

export async function getNearbyPlaces(place) {
  const params = wikiParams({
    generator: 'geosearch',
    ggscoord: `${place.lat}|${place.lon}`,
    ggsradius: 10000,
    ggslimit: 20,
    prop: 'pageimages|description',
    piprop: 'thumbnail',
    pithumbsize: 400,
  });
  const data = await getJSON(`${WIKI_URL}?${params}`);
  const pages = data.query ? data.query.pages : [];
  return pages.sort((a, b) => a.index - b.index).map(toPlace);
}

export function isSight(place) {
  const text = place.description.toLowerCase();
  return SIGHTS.some(word => text.includes(word));
}

export function pickNearby(places, mainTitle) {
  return places.filter(place => place.photo && place.title !== mainTitle && isSight(place)).slice(0, 4);
}
