import { pickNearby } from '../api/places.js';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces.js';

export default function PlaceInfo({ place, summary, summaryLoading }) {
  const { places, loading } = useNearbyPlaces(place);
  const nearby = pickNearby(places, summary ? summary.title : '');

  return (
    <>
      <section className="panel">
        <h2>About {place.name}</h2>
        {summaryLoading && <p className="muted">Looking for information about {place.name}…</p>}
        {!summaryLoading && !summary && <p className="muted">Wikipedia has no article about {place.name} yet.</p>}
        {summary && (
          <>
            {summary.description && <p className="small">{summary.description}</p>}
            <p>{summary.extract}</p>
            <a href={summary.url} target="_blank" rel="noreferrer">
              Read more on Wikipedia
            </a>
          </>
        )}
      </section>

      {!loading && nearby.length > 0 && (
        <section className="panel">
          <h2>Nearby to explore</h2>
          <ul className="nearby">
            {nearby.map(item => (
              <li key={item.url}>
                <a href={item.url} target="_blank" rel="noreferrer" className="nearby-card">
                  <img src={item.photo} alt={item.title} loading="lazy" />
                  <strong>{item.title}</strong>
                  {item.description && <span>{item.description}</span>}
                </a>
              </li>
            ))}
          </ul>
          <p className="small">Photos and descriptions from Wikipedia.</p>
        </section>
      )}
    </>
  );
}
