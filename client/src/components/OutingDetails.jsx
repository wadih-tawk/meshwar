import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ForecastPanel from './ForecastPanel.jsx';
import PlaceInfo from './PlaceInfo.jsx';
import PackingList from './PackingList.jsx';
import RouteMap from './RouteMap.jsx';
import { apiFetch } from '../api/client.js';
import { useForecast } from '../hooks/useForecast.js';
import { usePlaceSummary } from '../hooks/usePlaceSummary.js';
import { formatDate } from '../utils/dates.js';
import { activityIcon, activityLabel, activityPhoto, placeLabel } from '../utils/format.js';

export default function OutingDetails({ outing }) {
  const navigate = useNavigate();
  const { timing, forecast, error, loading, retry } = useForecast(outing.place, outing.date);
  const { summary, loading: summaryLoading } = usePlaceSummary(outing.place);
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function handleDelete() {
    try {
      await apiFetch(`/api/outings/${outing._id}`, { method: 'DELETE' });
      localStorage.removeItem(`packing-${outing._id}`);
      navigate('/outings');
    } catch (err) {
      setDeleteError(err.message);
    }
  }

  const photo = summary && summary.photo ? summary.photo : activityPhoto(outing.activity);

  return (
    <>
      <Link to="/outings" className="back">
        ← My outings
      </Link>
      <article className="outing">
        {summaryLoading ? (
          <div className="hero-photo card-photo-empty" />
        ) : (
          <img className="hero-photo" src={photo} alt={placeLabel(outing.place)} />
        )}

        <header className="outing-head">
          <p className={`activity-tag activity-${outing.activity}`}>
            {activityIcon(outing.activity)} {activityLabel(outing.activity)}
          </p>
          <h1>{outing.title}</h1>
          <p className="muted">
            {placeLabel(outing.place)} · {formatDate(outing.date)}
          </p>
        </header>

        <div className="outing-grid">
          <div className="outing-column">
            <ForecastPanel date={outing.date} timing={timing} forecast={forecast} error={error} loading={loading} retry={retry} />
            <RouteMap place={outing.place} />
            <PlaceInfo place={outing.place} summary={summary} summaryLoading={summaryLoading} />
          </div>

          <div className="outing-column">
            <PackingList outingId={outing._id} activity={outing.activity} forecast={forecast} />

            {outing.notes && (
              <section className="panel">
                <h2>Notes</h2>
                <p>{outing.notes}</p>
              </section>
            )}

            <div className="form-actions">
              <Link to={`/outings/${outing._id}/edit`} className="button">
                Edit
              </Link>
              {!confirming && (
                <button type="button" className="button button-danger" onClick={() => setConfirming(true)}>
                  Delete
                </button>
              )}
            </div>

            {confirming && (
              <div className="confirm" role="alert">
                <p>Delete this outing? This cannot be undone.</p>
                <div className="form-actions">
                  <button type="button" className="button button-danger" onClick={handleDelete}>
                    Yes, delete
                  </button>
                  <button type="button" className="button button-quiet" onClick={() => setConfirming(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {deleteError && <p className="error">{deleteError}</p>}
          </div>
        </div>
      </article>
    </>
  );
}
