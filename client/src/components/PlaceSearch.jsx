import { useState } from 'react';
import { searchPlaces } from '../api/weather.js';
import { placeLabel } from '../utils/format.js';

export default function PlaceSearch({ selected, onPick, error }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function handleSearch() {
    if (status === 'loading') {
      return;
    }
    const name = query.trim();
    if (name.length < 2) {
      setMessage('Type at least 2 letters');
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const places = await searchPlaces(name);
      setResults(places);
      setStatus('done');
    } catch (err) {
      setMessage(err.message);
      setStatus('error');
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  }

  function handlePick(place) {
    onPick({ name: place.name, country: place.country, lat: place.lat, lon: place.lon });
    setResults([]);
    setQuery('');
    setStatus('idle');
  }

  return (
    <div className="field">
      <label htmlFor="place-search">Place</label>
      {selected && (
        <p className="picked">
          <span>{placeLabel(selected)}</span>
        </p>
      )}
      <div className="search-row">
        <input
          id="place-search"
          type="search"
          value={query}
          placeholder={selected ? 'Search for another place' : 'e.g. Tripoli, Byblos, Faraya'}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="button" className="button button-quiet" onClick={handleSearch} disabled={status === 'loading'}>
          {status === 'loading' ? 'Searching…' : 'Search'}
        </button>
      </div>
      {status === 'error' && <p className="field-error">{message}</p>}
      {status === 'done' && results.length === 0 && <p className="field-error">No place found. Check the spelling or try the English name.</p>}
      {results.length > 0 && (
        <ul className="results">
          {results.map(place => (
            <li key={place.id}>
              <button type="button" onClick={() => handlePick(place)}>
                <strong>{place.name}</strong>
                <span>{place.region ? `${place.region}, ${place.country}` : place.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
