import { useState } from 'react';
import Comments from './Comments.jsx';
import SharePanel from './SharePanel.jsx';
import { apiFetch } from '../api/client.js';

function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

export default function PostActions({ post }) {
  const [likes, setLikes] = useState({ likeCount: post.likeCount, likedByMe: post.likedByMe });
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [shareCount, setShareCount] = useState(post.shareCount);
  const [open, setOpen] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function toggleLike() {
    setBusy(true);
    setError('');
    try {
      const next = await apiFetch(`/api/posts/${post.id}/like`, { method: likes.likedByMe ? 'DELETE' : 'PUT' });
      setLikes(next);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  function toggle(panel) {
    setOpen(current => (current === panel ? '' : panel));
  }

  return (
    <>
      <div className="post-actions">
        <button type="button" className={likes.likedByMe ? 'action action-on' : 'action'} aria-pressed={likes.likedByMe} disabled={busy} onClick={toggleLike}>
          {likes.likedByMe ? '♥' : '♡'} {plural(likes.likeCount, 'like')}
        </button>
        <button type="button" className="action" aria-expanded={open === 'comments'} onClick={() => toggle('comments')}>
          💬 {plural(commentCount, 'comment')}
        </button>
        {!post.hidden && (
          <button type="button" className="action" aria-expanded={open === 'share'} onClick={() => toggle('share')}>
            ↗ Share{shareCount > 0 ? ` · ${shareCount}` : ''}
          </button>
        )}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {open === 'comments' && <Comments postId={post.id} onCount={setCommentCount} />}
      {open === 'share' && <SharePanel postId={post.id} onShared={setShareCount} />}
    </>
  );
}
