import SuggestionItem from './SuggestionItem.jsx';
import { SUGGESTIONS } from '../utils/suggestions.js';
import { nextSaturday } from '../utils/dates.js';

export default function Suggestions() {
  const saturday = nextSaturday();

  return (
    <section id="ideas" className="ideas">
      <h2 className="section-title">Ideas for your next outing</h2>
      <p className="muted">Places around Lebanon, with the forecast for this Saturday.</p>
      <ul className="cards">
        {SUGGESTIONS.map(suggestion => (
          <SuggestionItem key={suggestion.place.name} suggestion={suggestion} date={saturday} />
        ))}
      </ul>
    </section>
  );
}
