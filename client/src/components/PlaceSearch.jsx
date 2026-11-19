import { useEffect, useState } from 'react';
import { searchPlaces } from '../api/weather.js';
import { placeLabel } from '../utils/format.js';

function Highlight({ text, query }) {
  const start = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (start === -1 || !query.trim()) {
    return text;
  }
  const end = start + query.trim().length;
  return (
    <>
      {text.slice(0, start)}
      <mark>{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  );
}

export default function PlaceSearch({ selected, onPick, error }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const name = query.trim();
    if (name.length < 2) {
      return;
    }

    let ignore = false;
    const timer = setTimeout(() => {
      setStatus('loading');
      searchPlaces(name)
        .then(places => {
          if (!ignore) {
            setResults(places);
            setActive(-1);
            setStatus('done');
          }
        })
        .catch(err => {
          if (!ignore) {
            setMessage(err.message);
            setStatus('error');
          }
        });
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query]);

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      setStatus('idle');
    }
  }

  function handlePick(place) {
    onPick({ name: place.name, country: place.country, lat: place.lat, lon: place.lon });
    setResults([]);
    setQuery('');
    setStatus('idle');
    setActive(-1);
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault();
      setActive((active + 1) % results.length);
    }
    if (e.key === 'ArrowUp' && results.length > 0) {
      e.preventDefault();
      setActive(active <= 0 ? results.length - 1 : active - 1);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0) {
        handlePick(results[active]);
      }
    }
    if (e.key === 'Escape') {
      setResults([]);
      setStatus('idle');
    }
  }

  return (
    <div className="field">
      <label htmlFor="place-search">Place</label>
      {selected && <p className="picked">📍 {placeLabel(selected)}</p>}
      <input
        id="place-search"
        type="search"
        value={query}
        autoComplete="off"
        placeholder={selected ? 'Type to choose another place' : 'Start typing: Tripoli, Byblos, Faraya…'}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {status === 'loading' && <p className="small">Searching…</p>}
      {status === 'error' && <p className="field-error">{message}</p>}
      {status === 'done' && results.length === 0 && <p className="field-error">No place found. Check the spelling or try the English name.</p>}
      {results.length > 0 && (
        <ul className="results">
          {results.map((place, index) => (
            <li key={place.id}>
              <button type="button" className={index === active ? 'result-active' : ''} onClick={() => handlePick(place)}>
                <strong>
                  <Highlight text={place.name} query={query} />
                </strong>
                <span>{place.region ? `${place.region}, ${place.country}` : place.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {results.length > 0 && <p className="small">Use ↑ ↓ and Enter, or click a place.</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
