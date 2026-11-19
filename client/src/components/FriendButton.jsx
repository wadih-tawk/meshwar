import { useState } from 'react';
import { apiFetch } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';

export default function FriendButton({ personId }) {
  const { data, loading, error } = useApi(`/api/friends/status/${personId}`);
  const [changed, setChanged] = useState(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');

  async function run(path, method, body) {
    setBusy(true);
    setProblem('');
    try {
      const result = await apiFetch(path, { method, body: body ? JSON.stringify(body) : undefined });
      setChanged(result || { status: 'none' });
    } catch (err) {
      setProblem(err.message);
    }
    setBusy(false);
  }

  if (loading) {
    return <p className="small">Checking friendship…</p>;
  }
  if (error) {
    return <p className="error">{error.message}</p>;
  }

  const { status, requestId } = changed || data;
  let actions;

  if (status === 'none') {
    actions = (
      <button type="button" className="button" disabled={busy} onClick={() => run('/api/friends/requests', 'POST', { userId: personId })}>
        + Add friend
      </button>
    );
  } else if (status === 'sent') {
    actions = (
      <>
        <span className="friend-state">Request sent</span>
        <button type="button" className="button button-quiet" disabled={busy} onClick={() => run(`/api/friends/requests/${requestId}`, 'DELETE')}>
          Cancel
        </button>
      </>
    );
  } else if (status === 'received') {
    actions = (
      <>
        <button type="button" className="button" disabled={busy} onClick={() => run(`/api/friends/requests/${requestId}/accept`, 'POST')}>
          Accept request
        </button>
        <button type="button" className="button button-quiet" disabled={busy} onClick={() => run(`/api/friends/requests/${requestId}`, 'DELETE')}>
          Decline
        </button>
      </>
    );
  } else {
    actions = (
      <>
        <span className="friend-state">✓ Friends</span>
        <button type="button" className="button button-quiet" disabled={busy} onClick={() => run(`/api/friends/${personId}`, 'DELETE')}>
          Remove friend
        </button>
      </>
    );
  }

  return (
    <div className="friend-actions">
      <div className="form-actions">{actions}</div>
      {problem && (
        <p className="error" role="alert">
          {problem}
        </p>
      )}
    </div>
  );
}
