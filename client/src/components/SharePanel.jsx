import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';

export default function SharePanel({ postId, onShared }) {
  const { data, loading, error } = useApi('/api/friends');
  const [friendId, setFriendId] = useState('');
  const [note, setNote] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setProblem('');
    try {
      const result = await apiFetch(`/api/posts/${postId}/share`, { method: 'POST', body: JSON.stringify({ friendId, note }) });
      onShared(result.shareCount);
      setSentTo(data.friends.find(friend => friend.id === friendId).name);
      setFriendId('');
      setNote('');
    } catch (err) {
      setProblem(err.message);
    }
    setBusy(false);
  }

  if (loading) {
    return <p className="small">Loading your friends…</p>;
  }
  if (error) {
    return <p className="error">{error.message}</p>;
  }
  if (data.friends.length === 0) {
    return (
      <p className="small share-panel">
        You can share posts with your friends. <Link to="/people">Find people to add</Link>.
      </p>
    );
  }

  return (
    <form className="share-panel" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor={`share-${postId}`}>Send to a friend</label>
        <select id={`share-${postId}`} value={friendId} onChange={e => setFriendId(e.target.value)} required>
          <option value="">Choose a friend</option>
          {data.friends.map(friend => (
            <option key={friend.id} value={friend.id}>
              {friend.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`note-${postId}`}>Note (optional)</label>
        <input id={`note-${postId}`} value={note} onChange={e => setNote(e.target.value)} maxLength={200} placeholder="We should go here!" />
      </div>
      <div className="form-actions">
        <button className="button" disabled={busy}>
          Send
        </button>
      </div>
      {sentTo && <p className="success">Sent to {sentTo}. Only the two of you can see this message.</p>}
      {problem && (
        <p className="error" role="alert">
          {problem}
        </p>
      )}
    </form>
  );
}
