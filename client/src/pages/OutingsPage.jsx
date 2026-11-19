import { useState } from 'react';
import { Link } from 'react-router-dom';
import ActivityFilter from '../components/ActivityFilter.jsx';
import HomeHero from '../components/HomeHero.jsx';
import OutingListItem from '../components/OutingListItem.jsx';
import Suggestions from '../components/Suggestions.jsx';
import { useAuth } from '../auth/AuthContext.js';
import { useApi } from '../hooks/useApi.js';
import { isPast } from '../utils/dates.js';

export default function OutingsPage() {
  const { user } = useAuth();
  const { data: outings, loading, error, reload } = useApi('/api/outings');
  const [showPast, setShowPast] = useState(false);
  const [activity, setActivity] = useState('all');

  let content;

  if (loading) {
    content = <p className="status">Loading your outings…</p>;
  } else if (error) {
    content = (
      <div className="status" role="alert">
        <p className="error">{error.message}</p>
        <button type="button" className="button button-quiet" onClick={reload}>
          Retry
        </button>
      </div>
    );
  } else if (outings.length === 0) {
    content = (
      <div className="empty">
        <p className="empty-title">Your first outing is one click away.</p>
        <p className="muted">Plan your own, or pick one of the ideas below and we fill in the form for you.</p>
        <Link to="/outings/new" className="button">
          + Plan an outing
        </Link>
      </div>
    );
  } else {
    const allUpcoming = outings.filter(outing => !isPast(outing.date));
    const next = allUpcoming[0];
    const shown = activity === 'all' ? outings : outings.filter(outing => outing.activity === activity);
    const upcoming = shown.filter(outing => !isPast(outing.date) && (!next || outing._id !== next._id));
    const past = shown.filter(outing => isPast(outing.date)).reverse();

    content = (
      <>
        {next && (
          <ul className="cards cards-single">
            <OutingListItem outing={next} featured />
          </ul>
        )}

        <div className="section-head">
          <h2 className="section-title">All my outings</h2>
          <p className="muted">
            {allUpcoming.length} upcoming · {outings.length - allUpcoming.length} past
          </p>
        </div>
        <ActivityFilter outings={outings} selected={activity} onSelect={setActivity} />

        {upcoming.length > 0 && (
          <ul className="cards">
            {upcoming.map(outing => (
              <OutingListItem key={outing._id} outing={outing} />
            ))}
          </ul>
        )}

        {upcoming.length === 0 && <p className="muted">No other upcoming outings here. Time for a new one?</p>}

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

  return (
    <>
      <HomeHero name={user ? user.name : ''} />
      <section className="home-section">
        <h2 className="section-title">{outings && outings.length > 0 ? 'Next up' : 'My outings'}</h2>
        {content}
      </section>
      <Suggestions />
    </>
  );
}
