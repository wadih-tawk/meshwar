import Avatar from '../components/Avatar.jsx';
import PostCard from '../components/PostCard.jsx';
import { useApi } from '../hooks/useApi.js';
import { timeAgo } from '../utils/dates.js';

export default function InboxPage() {
  const { data: messages, loading, error, reload } = useApi('/api/messages');

  let content;

  if (loading) {
    content = <p className="status">Loading your inbox…</p>;
  } else if (error) {
    content = (
      <div className="status" role="alert">
        <p className="error">{error.message}</p>
        <button type="button" className="button button-quiet" onClick={reload}>
          Retry
        </button>
      </div>
    );
  } else if (messages.length === 0) {
    content = <p className="muted">No messages yet. When a friend shares a post with you, it shows up here.</p>;
  } else {
    content = messages.map(message => {
      const received = message.direction === 'received';
      const other = received ? message.from : message.to;
      return (
        <section key={message.id} className="message">
          <div className="message-head">
            <Avatar name={other.name} url={other.avatarUrl} size="small" />
            <p>
              {received ? (
                <>
                  <strong>{other.name}</strong> shared a post with you
                </>
              ) : (
                <>
                  You shared a post with <strong>{other.name}</strong>
                </>
              )}
              <span className="small"> · {timeAgo(message.createdAt)}</span>
            </p>
          </div>
          {message.note && <p className="message-note">{message.note}</p>}
          {message.post ? <PostCard post={message.post} /> : <p className="post-removed">This post was deleted or hidden by its author.</p>}
        </section>
      );
    });
  }

  return (
    <div className="feed">
      <h1>Inbox</h1>
      <p className="muted">Posts you and your friends sent each other. Only the sender and the receiver can see a message.</p>
      {content}
    </div>
  );
}
