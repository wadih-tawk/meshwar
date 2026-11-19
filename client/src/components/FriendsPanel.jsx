import { useState } from 'react';
import PersonLink from './PersonLink.jsx';
import { apiFetch } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';

export default function FriendsPanel() {
  const { data, loading, error, reload } = useApi('/api/friends');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');

  async function answer(requestId, accept) {
    setBusy(true);
    setProblem('');
    try {
      if (accept) {
        await apiFetch(`/api/friends/requests/${requestId}/accept`, { method: 'POST' });
      } else {
        await apiFetch(`/api/friends/requests/${requestId}`, { method: 'DELETE' });
      }
      reload();
    } catch (err) {
      setProblem(err.message);
    }
    setBusy(false);
  }

  if (loading) {
    return <p className="status">Loading your friends…</p>;
  }
  if (error) {
    return (
      <div className="status" role="alert">
        <p className="error">{error.message}</p>
        <button type="button" className="button button-quiet" onClick={reload}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {data.incoming.length > 0 && (
        <section className="panel">
          <h2>Friend requests ({data.incoming.length})</h2>
          {problem && <p className="error">{problem}</p>}
          <ul className="people">
            {data.incoming.map(person => (
              <li key={person.requestId}>
                <PersonLink person={person}>
                  <button type="button" className="button" disabled={busy} onClick={() => answer(person.requestId, true)}>
                    Accept
                  </button>
                  <button type="button" className="button button-quiet" disabled={busy} onClick={() => answer(person.requestId, false)}>
                    Decline
                  </button>
                </PersonLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel">
        <h2>Your friends ({data.friends.length})</h2>
        {data.friends.length === 0 ? (
          <p className="muted">No friends yet. Search for people below and send a request.</p>
        ) : (
          <ul className="people">
            {data.friends.map(person => (
              <li key={person.requestId}>
                <PersonLink person={person} />
              </li>
            ))}
          </ul>
        )}
        {data.outgoing.length > 0 && <p className="small">Waiting for an answer from: {data.outgoing.map(person => person.name).join(', ')}</p>}
      </section>
    </>
  );
}
