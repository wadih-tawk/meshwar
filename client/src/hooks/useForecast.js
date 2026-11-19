import { useEffect, useState } from 'react';
import { getForecast } from '../api/weather.js';
import { forecastTiming } from '../utils/dates.js';

export function useForecast(place, date) {
  const timing = forecastTiming(date);
  const { lat, lon } = place;
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(timing === 'ready');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (timing !== 'ready') {
      return;
    }

    let ignore = false;

    getForecast(lat, lon, date)
      .then(data => {
        if (!ignore) {
          setForecast(data);
          setError(null);
        }
      })
      .catch(err => {
        if (!ignore) {
          setError(err);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [lat, lon, date, timing, attempt]);

  function retry() {
    setLoading(true);
    setError(null);
    setAttempt(count => count + 1);
  }

  return { timing, forecast, error, loading, retry };
}
