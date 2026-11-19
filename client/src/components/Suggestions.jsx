import { useState } from 'react';
import SuggestionItem from './SuggestionItem.jsx';
import { SUGGESTIONS } from '../utils/suggestions.js';
import { nextSaturday } from '../utils/dates.js';

export default function Suggestions() {
  const saturday = nextSaturday();
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? SUGGESTIONS : SUGGESTIONS.slice(0, 8);

  return (
    <section id="ideas" className="ideas">
      <h2 className="section-title">Ideas for your next outing</h2>
      <p className="muted">Places around Lebanon, with the forecast for this Saturday.</p>
      <ul className="cards">
        {shown.map(suggestion => (
          <SuggestionItem key={suggestion.place.name} suggestion={suggestion} date={saturday} />
        ))}
      </ul>
      {SUGGESTIONS.length > 8 && (
        <button type="button" className="section-toggle" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show fewer ideas' : `Show all ${SUGGESTIONS.length} ideas`}
        </button>
      )}
    </section>
  );
}
