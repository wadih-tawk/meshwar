import SuggestionCard from './SuggestionCard.jsx';
import { useForecast } from '../hooks/useForecast.js';
import { usePlaceSummary } from '../hooks/usePlaceSummary.js';

export default function SuggestionItem({ suggestion, date }) {
  const { forecast, loading } = useForecast(suggestion.place, date);
  const { summary, loading: photoLoading } = usePlaceSummary(suggestion.place);

  return (
    <li>
      <SuggestionCard
        suggestion={suggestion}
        date={date}
        photo={summary ? summary.photo : null}
        photoLoading={photoLoading}
        forecast={loading ? null : forecast}
      />
    </li>
  );
}
