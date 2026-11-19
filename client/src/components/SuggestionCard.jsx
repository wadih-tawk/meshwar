import { Link } from 'react-router-dom';
import { getVerdict } from '../utils/verdict.js';
import { formatShortDate } from '../utils/dates.js';
import { activityIcon, activityLabel, activityPhoto, formatRange } from '../utils/format.js';

export default function SuggestionCard({ suggestion, date, photo, photoLoading, forecast }) {
  const verdict = forecast ? getVerdict(forecast) : null;

  return (
    <article className="card idea">
      {suggestion.photos ? (
        <img className="card-photo" src={suggestion.photos[0].src} alt={suggestion.place.name} loading="lazy" />
      ) : photoLoading ? (
        <div className="card-photo card-photo-empty" />
      ) : (
        <img className="card-photo" src={photo || activityPhoto(suggestion.activity)} alt={suggestion.place.name} loading="lazy" />
      )}
      <div className="card-body">
        <p className={`activity-tag activity-${suggestion.activity}`}>
          {activityIcon(suggestion.activity)} {activityLabel(suggestion.activity)}
        </p>
        <h3 className="card-title">
          <Link to={`/ideas/${suggestion.slug}`}>{suggestion.label || suggestion.place.name}</Link>
        </h3>
        <p className="card-meta">{suggestion.blurb}</p>
        <p className="idea-weather">
          {formatShortDate(date)}
          {forecast && ` · ${formatRange(forecast.min, forecast.max)}`}
          {verdict && <span className={`verdict verdict-${verdict.tone}`}>{verdict.text}</span>}
        </p>
        <div className="idea-actions">
          <Link to="/outings/new" state={{ suggestion, date }} className="button button-small">
            Plan an outing here
          </Link>
          <Link to={`/ideas/${suggestion.slug}`} className="button button-small button-quiet">
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
