import { useState } from 'react';
import { Link } from 'react-router-dom';
import ActivityFilter from '../components/ActivityFilter.jsx';
import OutingListItem from '../components/OutingListItem.jsx';
import { useApi } from '../hooks/useApi.js';
import { isPast } from '../utils/dates.js';

export default function OutingsPage() {
  const { data: outings, loading, error, reload } = useApi('/api/outings');
  const [showPast, setShowPast] = useState(false);
  const [activity, setActivity] = useState('all');

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

  const shown = activity === 'all' ? outings : outings.filter(outing => outing.activity === activity);
  const upcoming = shown.filter(outing => !isPast(outing.date));
  const past = shown.filter(outing => isPast(outing.date)).reverse();
  const upcomingCount = outings.filter(outing => !isPast(outing.date)).length;

  return (
    <>
      <h1>My outings</h1>
      {outings.length > 0 && (
        <p className="muted">
          {upcomingCount} upcoming · {outings.length - upcomingCount} past
        </p>
      )}
      <ActivityFilter outings={outings} selected={activity} onSelect={setActivity} />

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
              <OutingListItem key={outing._id} outing={outing} />
            ))}
          </ul>
        </section>
      )}

      {shown.length > 0 && upcoming.length === 0 && <p className="muted">Nothing planned. Time for a new outing?</p>}

      {past.length > 0 && (
        <section>
          <button type="button" className="section-toggle" onClick={() => setShowPast(!showPast)}>
            {showPast ? 'Hide' : 'Show'} past outings ({past.length})
          </button>
          {showPast && (
            <ul className="cards">
              {past.map(outing => (
                <OutingListItem key={outing._id} outing={outing} />
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
