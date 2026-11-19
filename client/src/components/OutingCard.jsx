import { Link } from 'react-router-dom';
import { formatShortDate } from '../utils/dates.js';
import { activityLabel } from '../utils/format.js';

export default function OutingCard({ outing }) {
  return (
    <Link to={`/outings/${outing._id}`} className="card">
      <h3 className="card-title">{outing.title}</h3>
      <p className="card-meta">
        {activityLabel(outing.activity)} · {outing.place.name}
      </p>
      <p className="card-meta">{formatShortDate(outing.date)}</p>
    </Link>
  );
}
