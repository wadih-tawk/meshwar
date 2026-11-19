import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then(res => res.json())
      .then(data => setStatus(data.ok ? 'ok' : 'error'))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <main>
      <h1>Meshwar</h1>
      {status === 'loading' && <p>Checking the API…</p>}
      {status === 'ok' && <p>The API answered: ok</p>}
      {status === 'error' && <p>The API did not answer. Is the server running?</p>}
    </main>
  );
}
