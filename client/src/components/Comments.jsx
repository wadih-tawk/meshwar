import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { apiFetch } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { timeAgo } from '../utils/dates.js';

export default function Comments({ postId, onCount }) {
  const { data, loading, error } = useApi(`/api/posts/${postId}/comments`);
  const [added, setAdded] = useState([]);
  const [removed, setRemoved] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setProblem('');
    try {
      const result = await apiFetch(`/api/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ text }) });
      setAdded(list => [...list, result.comment]);
      onCount(result.commentCount);
      setText('');
    } catch (err) {
      setProblem(err.message);
    }
    setBusy(false);
  }

  async function handleDelete(commentId) {
    setProblem('');
    try {
      const result = await apiFetch(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
      setRemoved(list => [...list, commentId]);
      onCount(result.commentCount);
    } catch (err) {
      setProblem(err.message);
    }
  }

  if (loading) {
    return <p className="small">Loading comments…</p>;
  }
  if (error) {
    return <p className="error">{error.message}</p>;
  }

  const comments = [...data, ...added].filter(comment => !removed.includes(comment.id));

  return (
    <div className="comments">
      {comments.length === 0 && <p className="small">No comments yet. Be the first!</p>}
      {comments.map(comment => (
        <div key={comment.id} className="comment">
          <Avatar name={comment.author.name} url={comment.author.avatarUrl} size="small" />
          <div className="comment-body">
            <p className="comment-head">
              <Link to={`/people/${comment.author.id}`}>{comment.author.name}</Link>
              <span className="small">{timeAgo(comment.createdAt)}</span>
            </p>
            <p className="comment-text">{comment.text}</p>
            {comment.canDelete && (
              <button type="button" className="text-button text-danger" onClick={() => handleDelete(comment.id)}>
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
      <form className="comment-form" onSubmit={handleSubmit}>
        <label htmlFor={`comment-${postId}`} className="visually-hidden">
          Write a comment
        </label>
        <input id={`comment-${postId}`} value={text} onChange={e => setText(e.target.value)} maxLength={300} placeholder="Write a comment…" required />
        <button className="button" disabled={busy || text.trim() === ''}>
          Send
        </button>
      </form>
      {problem && (
        <p className="error" role="alert">
          {problem}
        </p>
      )}
    </div>
  );
}
