import { useEffect, useState } from 'react';
import { getNearbyPlaces } from '../api/places.js';

export function useNearbyPlaces(place) {
  const { lat, lon } = place;
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    getNearbyPlaces({ lat, lon })
      .then(data => {
        if (!ignore) {
          setPlaces(data);
        }
      })
      .catch(() => {
        if (!ignore) {
          setPlaces([]);
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
  }, [lat, lon]);

  return { places, loading };
}
