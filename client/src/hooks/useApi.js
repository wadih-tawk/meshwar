import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client.js';

export function useApi(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;

    apiFetch(path)
      .then(result => {
        if (!ignore) {
          setData(result);
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
  }, [path, attempt]);

  function reload() {
    setLoading(true);
    setError(null);
    setAttempt(count => count + 1);
  }

  return { data, error, loading, reload };
}
