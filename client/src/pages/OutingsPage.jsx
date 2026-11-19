import { useState } from 'react';
import { Link } from 'react-router-dom';
import OutingCard from '../components/OutingCard.jsx';
import { useApi } from '../hooks/useApi.js';
import { isPast } from '../utils/dates.js';

export default function OutingsPage() {
  const { data: outings, loading, error, reload } = useApi('/api/outings');
  const [showPast, setShowPast] = useState(false);

  if (loading) {
    return <p className="status">Loading your outings…</p>;
  }

  if (error) {
    return (
      <div className="status" role="alert">
        <p className="error">{error.message}</p>
        <button type="button" className="button button-quiet" onClick={reload}>
          Retry
        </button>
      </div>
    );
  }

  const upcoming = outings.filter(outing => !isPast(outing.date));
  const past = outings.filter(outing => isPast(outing.date)).reverse();

  return (
    <>
      <h1>My outings</h1>

      {outings.length === 0 && (
        <div className="empty">
          <p>No outings yet. Plan one and Meshwar will show you the forecast for that day.</p>
          <Link to="/outings/new" className="button">
            Plan your first outing
          </Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="section-title">Upcoming</h2>
          <ul className="cards">
            {upcoming.map(outing => (
              <li key={outing._id}>
                <OutingCard outing={outing} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {outings.length > 0 && upcoming.length === 0 && <p className="muted">Nothing planned. Time for a new outing?</p>}

      {past.length > 0 && (
        <section>
          <button type="button" className="section-toggle" onClick={() => setShowPast(!showPast)}>
            {showPast ? 'Hide' : 'Show'} past outings ({past.length})
          </button>
          {showPast && (
            <ul className="cards">
              {past.map(outing => (
                <li key={outing._id}>
                  <OutingCard outing={outing} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
