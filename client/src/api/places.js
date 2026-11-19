const WIKI_URL = 'https://en.wikipedia.org/w/api.php';
const NEAR = 0.3;

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

function toPlace(page) {
  return {
    title: page.title,
    description: page.description ?? '',
    extract: page.extract ?? '',
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
  if (pages.length === 0 || !isNear(pages[0], place.lat, place.lon)) {
    return null;
  }
  return toPlace(pages[0]);
}
