import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';

export default function PersonLink({ person, children }) {
  return (
    <div className="person">
      <Link to={`/people/${person.id}`} className="person-main">
        <Avatar name={person.name} url={person.avatarUrl} />
        <span>
          <strong>{person.name}</strong>
          {person.bio && <span className="small">{person.bio}</span>}
        </span>
      </Link>
      {children && <div className="person-actions">{children}</div>}
    </div>
  );
}
