import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { apiFetch, imageSrc } from '../api/client.js';
import { timeAgo } from '../utils/dates.js';
import { activityIcon } from '../utils/format.js';

export default function PostCard({ post: initial }) {
  const [post, setPost] = useState(initial);
  const [deleted, setDeleted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial.caption);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save(changes) {
    setBusy(true);
    setError('');
    try {
      const body = JSON.stringify({ caption: post.caption, hidden: post.hidden, ...changes });
      const next = await apiFetch(`/api/posts/${post.id}`, { method: 'PUT', body });
      setPost(next);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function remove() {
    setBusy(true);
    try {
      await apiFetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      setDeleted(true);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  function handleEdit(e) {
    e.preventDefault();
    save({ caption: draft });
  }

  if (deleted) {
    return <p className="post-removed">Post deleted.</p>;
  }

  return (
    <article className={post.hidden ? 'post post-hidden' : 'post'}>
      <header className="post-head">
        <Link to={`/people/${post.author.id}`} className="post-author">
          <Avatar name={post.author.name} url={post.author.avatarUrl} size="small" />
          <span>
            <strong>{post.author.name}</strong>
            <span className="small">{timeAgo(post.createdAt)}</span>
          </span>
        </Link>
        {post.hidden && <span className="badge">Hidden · only you see it</span>}
      </header>

      <img className="post-photo" src={imageSrc(post.imageUrl)} alt={post.caption || `Photo by ${post.author.name}`} loading="lazy" />

      <div className="post-body">
        {post.outing && (
          <p className="post-outing">
            {activityIcon(post.outing.activity)} {post.outing.title} · {post.outing.place}
          </p>
        )}

        {editing ? (
          <form className="form" onSubmit={handleEdit}>
            <label htmlFor={`caption-${post.id}`} className="small">
              Edit caption
            </label>
            <textarea id={`caption-${post.id}`} rows={3} value={draft} onChange={e => setDraft(e.target.value)} maxLength={500} />
            <div className="form-actions">
              <button className="button" disabled={busy}>
                Save
              </button>
              <button type="button" className="button button-quiet" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          post.caption && <p className="post-caption">{post.caption}</p>
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {post.mine && !editing && !confirming && (
          <div className="post-owner">
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setDraft(post.caption);
                setEditing(true);
              }}
            >
              Edit
            </button>
            <button type="button" className="text-button" disabled={busy} onClick={() => save({ hidden: !post.hidden })}>
              {post.hidden ? 'Show to everyone' : 'Hide'}
            </button>
            <button type="button" className="text-button text-danger" onClick={() => setConfirming(true)}>
              Delete
            </button>
          </div>
        )}

        {confirming && (
          <div className="confirm" role="alert">
            <p>Delete this post and its photo? This cannot be undone.</p>
            <div className="form-actions">
              <button type="button" className="button button-danger" disabled={busy} onClick={remove}>
                Yes, delete
              </button>
              <button type="button" className="button button-quiet" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
