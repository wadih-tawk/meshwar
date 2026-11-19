import PostCard from './PostCard.jsx';

export default function PostList({ posts, empty }) {
  if (posts.length === 0) {
    return <p className="muted">{empty}</p>;
  }
  return (
    <div className="post-list">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
