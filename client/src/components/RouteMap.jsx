import { useState } from 'react';
import { directionsUrl, placeMapUrl, routeMapUrl } from '../utils/maps.js';

export default function RouteMap({ place }) {
  const [from, setFrom] = useState(null);
  const [status, setStatus] = useState('idle');

  function showRoute() {
    if (!navigator.geolocation) {
      setStatus('error');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      position => {
        setFrom({ lat: position.coords.latitude, lon: position.coords.longitude });
        setStatus('idle');
      },
      () => setStatus('error'),
      { timeout: 10000 }
    );
  }

  return (
    <section className="panel">
      <h2>Getting there</h2>
      <p className="small">{from ? `The route from where you are now to ${place.name}.` : `Where ${place.name} is.`}</p>
      <iframe
        className="map"
        title={from ? `Route to ${place.name}` : `Map of ${place.name}`}
        src={from ? routeMapUrl(from, place) : placeMapUrl(place)}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="form-actions">
        {!from && (
          <button type="button" className="button" onClick={showRoute} disabled={status === 'locating'}>
            {status === 'locating' ? 'Finding you…' : '📍 Show the route from where I am'}
          </button>
        )}
        <a href={directionsUrl(place, from)} target="_blank" rel="noreferrer" className="button button-quiet">
          Open in Google Maps ↗
        </a>
      </div>
      {status === 'error' && (
        <p className="field-error">We could not get your location. You can still open the route in Google Maps.</p>
      )}
    </section>
  );
}
