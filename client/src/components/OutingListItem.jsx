import OutingCard from './OutingCard.jsx';
import { useForecast } from '../hooks/useForecast.js';

export default function OutingListItem({ outing }) {
  const { timing, forecast, loading, error } = useForecast(outing.place, outing.date);

  return (
    <li>
      <OutingCard outing={outing} timing={timing} forecast={forecast} loading={loading} error={error} />
    </li>
  );
}
