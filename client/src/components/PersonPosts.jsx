import PostList from './PostList.jsx';
import { useApi } from '../hooks/useApi.js';

export default function PersonPosts({ personId }) {
  const { data: posts, loading, error } = useApi(`/api/posts/user/${personId}`);

  if (loading) {
    return <p className="status">Loading posts…</p>;
  }
  if (error) {
    return <p className="error">{error.message}</p>;
  }
  return (
    <>
      <h2 className="section-title">Posts ({posts.length})</h2>
      <PostList posts={posts} empty="No posts yet." />
    </>
  );
}
