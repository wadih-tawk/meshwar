import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ForecastPanel from '../components/ForecastPanel.jsx';
import { apiFetch } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { formatDate } from '../utils/dates.js';
import { activityLabel, placeLabel } from '../utils/format.js';

export default function OutingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: outing, loading, error } = useApi(`/api/outings/${id}`);
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function handleDelete() {
    try {
      await apiFetch(`/api/outings/${id}`, { method: 'DELETE' });
      navigate('/outings');
    } catch (err) {
      setDeleteError(err.message);
    }
  }

  if (loading) {
    return <p className="status">Loading the outing…</p>;
  }

  if (error) {
    return (
      <div className="status" role="alert">
        <h1>Could not open this outing</h1>
        <p className="muted">{error.message}</p>
        <Link to="/outings" className="button button-quiet">
          Back to my outings
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link to="/outings" className="back">
        ← My outings
      </Link>
      <article className="outing">
        <header className="outing-head">
          <p className="tag">{activityLabel(outing.activity)}</p>
          <h1>{outing.title}</h1>
          <p className="muted">
            {placeLabel(outing.place)} · {formatDate(outing.date)}
          </p>
        </header>

        <ForecastPanel place={outing.place} date={outing.date} />

        {outing.notes && (
          <section className="panel">
            <h2>Notes</h2>
            <p className="notes">{outing.notes}</p>
          </section>
        )}

        <div className="form-actions">
          <Link to={`/outings/${id}/edit`} className="button">
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
      </article>
    </>
  );
}
