import OutingCard from './OutingCard.jsx';
import { useForecast } from '../hooks/useForecast.js';
import { usePlaceSummary } from '../hooks/usePlaceSummary.js';

export default function OutingListItem({ outing, featured }) {
  const { timing, forecast, loading, error } = useForecast(outing.place, outing.date);
  const { summary, loading: photoLoading } = usePlaceSummary(outing.place);

  return (
    <li>
      <OutingCard
        outing={outing}
        photo={summary ? summary.photo : null}
        photoLoading={photoLoading}
        timing={timing}
        forecast={forecast}
        loading={loading}
        error={error}
        featured={featured}
      />
    </li>
  );
}
