import { Link } from 'react-router-dom';
import { getVerdict } from '../utils/verdict.js';
import { formatShortDate } from '../utils/dates.js';
import { activityIcon, activityLabel, activityPhoto, formatRange } from '../utils/format.js';

export default function SuggestionCard({ suggestion, date, photo, photoLoading, forecast }) {
  const verdict = forecast ? getVerdict(forecast) : null;

  return (
    <article className="card idea">
      {photoLoading ? (
        <div className="card-photo card-photo-empty" />
      ) : (
        <img className="card-photo" src={photo || activityPhoto(suggestion.activity)} alt={suggestion.place.name} loading="lazy" />
      )}
      <div className="card-body">
        <p className={`activity-tag activity-${suggestion.activity}`}>
          {activityIcon(suggestion.activity)} {activityLabel(suggestion.activity)}
        </p>
        <h3 className="card-title">{suggestion.place.name}</h3>
        <p className="card-meta">{suggestion.blurb}</p>
        <p className="idea-weather">
          {formatShortDate(date)}
          {forecast && ` · ${formatRange(forecast.min, forecast.max)}`}
          {verdict && <span className={`verdict verdict-${verdict.tone}`}>{verdict.text}</span>}
        </p>
        <Link to="/outings/new" state={{ suggestion, date }} className="button button-small">
          Plan an outing here
        </Link>
      </div>
    </article>
  );
}
