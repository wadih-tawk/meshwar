import { Link } from 'react-router-dom';
import { getVerdict } from '../utils/verdict.js';
import { availableFrom, formatShortDate } from '../utils/dates.js';
import { activityIcon, activityLabel, activityPhoto, formatRange } from '../utils/format.js';

function ForecastLine({ date, timing, forecast, loading, error }) {
  if (timing === 'past') {
    return <p className="card-note">This outing is in the past</p>;
  }
  if (timing === 'later') {
    return <p className="card-note">Forecast from {formatShortDate(availableFrom(date))}</p>;
  }
  if (loading) {
    return <p className="card-note">Loading forecast…</p>;
  }
  if (error) {
    return <p className="card-note">Forecast unavailable</p>;
  }
  if (!forecast) {
    return <p className="card-note">Loading forecast…</p>;
  }
  const verdict = getVerdict(forecast);
  if (!verdict) {
    return <p className="card-note">Forecast not complete yet</p>;
  }
  return <p className={`verdict verdict-${verdict.tone}`}>{verdict.text}</p>;
}

export default function OutingCard({ outing, photo, photoLoading, timing, forecast, loading, error }) {
  const showRange = timing === 'ready' && !loading && forecast;

  return (
    <Link to={`/outings/${outing._id}`} className="card">
      {photoLoading ? (
        <div className="card-photo card-photo-empty" />
      ) : (
        <img className="card-photo" src={photo || activityPhoto(outing.activity)} alt={outing.place.name} loading="lazy" />
      )}
      <div className="card-body">
        <p className="activity-tag">
          {activityIcon(outing.activity)} {activityLabel(outing.activity)}
        </p>
        <h3 className="card-title">{outing.title}</h3>
        <p className="card-meta">
          {outing.place.name} · {formatShortDate(outing.date)}
          {showRange && ` · ${formatRange(forecast.min, forecast.max)}`}
        </p>
        <ForecastLine date={outing.date} timing={timing} forecast={forecast} loading={loading} error={error} />
      </div>
    </Link>
  );
}
