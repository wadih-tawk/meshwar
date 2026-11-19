import { useState } from 'react';
import { Link } from 'react-router-dom';
import PostComposer from '../components/PostComposer.jsx';
import PostList from '../components/PostList.jsx';
import StoryBar from '../components/StoryBar.jsx';
import { useApi } from '../hooks/useApi.js';

export default function FeedPage() {
  const { data, loading, error, reload } = useApi('/api/posts/feed');
  const [added, setAdded] = useState([]);

  let content;

  if (loading) {
    content = <p className="status">Loading the feed…</p>;
  } else if (error) {
    content = (
      <div className="status" role="alert">
        <p className="error">{error.message}</p>
        <button type="button" className="button button-quiet" onClick={reload}>
          Retry
        </button>
      </div>
    );
  } else {
    content = (
      <>
        <h2 className="section-title">You and your friends</h2>
        <PostList posts={[...added, ...data.friends]} empty="No posts from you or your friends yet." />
        {data.friends.length === 0 && added.length === 0 && (
          <p className="small">
            <Link to="/people">Find friends</Link> to see their outings here.
          </p>
        )}
        <h2 className="section-title">Discover</h2>
        <PostList posts={data.others} empty="Nobody else has posted yet." />
      </>
    );
  }

  return (
    <div className="feed">
      <h1>Feed</h1>
      <p className="muted">Photos from outings: your friends first, then everyone on Meshwar.</p>
      <StoryBar />
      <PostComposer onPosted={post => setAdded(list => [post, ...list])} />
      {content}
    </div>
  );
}
