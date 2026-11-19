import { getVerdict } from '../utils/verdict.js';
import { availableFrom, formatDate } from '../utils/dates.js';
import { describeWeather, formatPercent, formatTemp, formatWind } from '../utils/format.js';

export default function ForecastPanel({ title = 'Forecast', date, timing, forecast, error, loading, retry }) {
  if (timing === 'past') {
    return (
      <section className="panel">
        <h2>{title}</h2>
        <p className="muted">This outing is in the past, so there is no forecast to show.</p>
      </section>
    );
  }

  if (timing === 'later') {
    return (
      <section className="panel">
        <h2>{title}</h2>
        <p className="muted">Forecast available from {formatDate(availableFrom(date))}.</p>
        <p className="small">Forecasts only reach two weeks ahead.</p>
      </section>
    );
  }

  if (error && !loading) {
    return (
      <section className="panel">
        <h2>{title}</h2>
        <p className="error" role="alert">
          {error.message}
        </p>
        <button type="button" className="button button-quiet" onClick={retry}>
          Retry
        </button>
      </section>
    );
  }

  if (loading || !forecast) {
    return (
      <section className="panel">
        <h2>{title}</h2>
        <p className="muted">Loading the forecast…</p>
      </section>
    );
  }

  const verdict = getVerdict(forecast);
  const weather = describeWeather(forecast.code);

  return (
    <section className="panel">
      <h2>{title}</h2>
      {weather && (
        <p className="weather-line">
          <span className="weather-icon">{weather.icon}</span> {weather.label}
        </p>
      )}
      {verdict ? (
        <p className={`verdict verdict-large verdict-${verdict.tone}`}>{verdict.text}</p>
      ) : (
        <p className="muted">The forecast for this day is not complete yet. Check again tomorrow.</p>
      )}
      <dl className="stats">
        <div>
          <dt>Min</dt>
          <dd>{formatTemp(forecast.min)}</dd>
        </div>
        <div>
          <dt>Max</dt>
          <dd>{formatTemp(forecast.max)}</dd>
        </div>
        <div>
          <dt>Rain chance</dt>
          <dd>{formatPercent(forecast.rainChance)}</dd>
        </div>
        <div>
          <dt>Wind</dt>
          <dd>{formatWind(forecast.wind)}</dd>
        </div>
      </dl>
      <p className="small">Forecast by Open-Meteo.</p>
    </section>
  );
}
