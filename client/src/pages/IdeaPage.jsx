import { Link, useParams } from 'react-router-dom';
import ForecastPanel from '../components/ForecastPanel.jsx';
import ListPanel from '../components/ListPanel.jsx';
import PhotoGallery from '../components/PhotoGallery.jsx';
import RouteMap from '../components/RouteMap.jsx';
import { useForecast } from '../hooks/useForecast.js';
import { usePlaceSummary } from '../hooks/usePlaceSummary.js';
import { findSuggestion } from '../utils/suggestions.js';
import { nextSaturday } from '../utils/dates.js';
import { directionsUrl } from '../utils/maps.js';
import { activityIcon, activityLabel, activityPhoto } from '../utils/format.js';

function IdeaDetails({ idea }) {
  const saturday = nextSaturday();
  const { timing, forecast, error, loading, retry } = useForecast(idea.place, saturday);
  const { summary, loading: summaryLoading } = usePlaceSummary(idea.place);
  const about = idea.about || (summary ? summary.extract : '');
  const heroPhoto = summary && summary.photo ? summary.photo : activityPhoto(idea.activity);

  return (
    <>
      <Link to="/outings" className="back">
        ← Back home
      </Link>
      <article className="outing">
        {idea.photos ? (
          <PhotoGallery photos={idea.photos} title={idea.place.name} />
        ) : summaryLoading ? (
          <div className="hero-photo card-photo-empty" />
        ) : (
          <img className="hero-photo" src={heroPhoto} alt={idea.place.name} />
        )}

        <header className="outing-head">
          <p className={`activity-tag activity-${idea.activity}`}>
            {activityIcon(idea.activity)} {activityLabel(idea.activity)}
          </p>
          <h1>{idea.title}</h1>
          <p className="muted">{idea.blurb}</p>
          <Link to="/outings/new" state={{ suggestion: idea, date: saturday }} className="button">
            Plan an outing here
          </Link>
        </header>

        <div className="outing-grid">
          <div className="outing-column">
            <section className="panel">
              <h2>About</h2>
              {about ? <p>{about}</p> : <p className="muted">Looking for information…</p>}
              {!idea.about && summary && (
                <a href={summary.url} target="_blank" rel="noreferrer">
                  Read more on Wikipedia
                </a>
              )}
              {idea.link && (
                <p>
                  Official site:{' '}
                  <a href={idea.link.url} target="_blank" rel="noreferrer">
                    {idea.link.label}
                  </a>
                </p>
              )}
            </section>

            {idea.todo && <ListPanel title="What to do" items={idea.todo} />}

            {idea.stops && (
              <section className="panel">
                <h2>Stops on the way</h2>
                <ol className="stops">
                  {idea.stops.map(stop => (
                    <li key={stop.name}>
                      <strong>{stop.name}</strong>
                      <p>{stop.note}</p>
                      <a href={directionsUrl(stop)} target="_blank" rel="noreferrer">
                        Directions ↗
                      </a>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <RouteMap place={idea.place} />
          </div>

          <div className="outing-column">
            <ForecastPanel title="This Saturday" date={saturday} timing={timing} forecast={forecast} error={error} loading={loading} retry={retry} />
            {idea.eat && <ListPanel title="Where to eat" items={idea.eat} />}
            {idea.stay && <ListPanel title="Where to stay" items={idea.stay} />}
            {idea.tips && <ListPanel title="Good to know" items={idea.tips} />}
          </div>
        </div>
      </article>
    </>
  );
}

export default function IdeaPage() {
  const { slug } = useParams();
  const idea = findSuggestion(slug);

  if (!idea) {
    return (
      <div className="status" role="alert">
        <h1>Idea not found</h1>
        <p className="muted">There is no outing idea at this address.</p>
        <Link to="/outings" className="button button-quiet">
          Back home
        </Link>
      </div>
    );
  }

  return <IdeaDetails idea={idea} />;
}
