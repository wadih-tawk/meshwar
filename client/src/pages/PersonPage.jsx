import { Link, useParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import FriendButton from '../components/FriendButton.jsx';
import { useAuth } from '../auth/AuthContext.js';
import { useApi } from '../hooks/useApi.js';
import { formatDate } from '../utils/dates.js';

export default function PersonPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: person, loading, error } = useApi(`/api/users/${id}`);

  if (loading) {
    return <p className="status">Loading the profile…</p>;
  }
  if (error) {
    return (
      <div className="status" role="alert">
        <h1>Profile not found</h1>
        <p className="muted">{error.message}</p>
        <Link to="/people" className="button button-quiet">
          Find people
        </Link>
      </div>
    );
  }

  const isMe = user && user.id === person.id;

  return (
    <section className="panel profile-card">
      <Avatar name={person.name} url={person.avatarUrl} size="large" />
      <h1>{person.name}</h1>
      <p className="muted">Joined {formatDate(person.joinedAt.slice(0, 10))}</p>
      {person.bio ? <p className="bio">{person.bio}</p> : <p className="muted">No bio yet.</p>}
      {!isMe && <FriendButton key={person.id} personId={person.id} />}
      {isMe && (
        <Link to="/me" className="button button-quiet">
          Edit my profile
        </Link>
      )}
    </section>
  );
}
