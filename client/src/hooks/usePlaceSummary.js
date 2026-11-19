import { useEffect, useState } from 'react';
import { getPlaceSummary } from '../api/places.js';

export function usePlaceSummary(place) {
  const { name, country, lat, lon } = place;
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    getPlaceSummary({ name, country, lat, lon })
      .then(data => {
        if (!ignore) {
          setSummary(data);
        }
      })
      .catch(() => {
        if (!ignore) {
          setSummary(null);
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
  }, [name, country, lat, lon]);

  return { summary, loading };
}
