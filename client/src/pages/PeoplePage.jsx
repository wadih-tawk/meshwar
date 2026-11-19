import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import { apiFetch } from '../api/client.js';

export default function PeoplePage() {
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState([]);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const name = query.trim();
    if (name.length < 2) {
      return;
    }
    let ignore = false;
    const timer = setTimeout(() => {
      setStatus('loading');
      apiFetch(`/api/users?q=${encodeURIComponent(name)}`)
        .then(found => {
          if (!ignore) {
            setPeople(found);
            setStatus('done');
          }
        })
        .catch(err => {
          if (!ignore) {
            setMessage(err.message);
            setStatus('error');
          }
        });
    }, 300);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query]);

  function handleChange(e) {
    setQuery(e.target.value);
    if (e.target.value.trim().length < 2) {
      setPeople([]);
      setStatus('idle');
    }
  }

  return (
    <>
      <h1>People</h1>
      <p className="muted">Find friends by name and see where they like to go.</p>
      <div className="field people-search">
        <label htmlFor="people-search">Search by name</label>
        <input id="people-search" type="search" value={query} onChange={handleChange} maxLength={50} placeholder="Type at least 2 letters" autoComplete="off" />
      </div>
      {status === 'loading' && <p className="small">Searching…</p>}
      {status === 'error' && <p className="error">{message}</p>}
      {status === 'done' && people.length === 0 && <p className="muted">Nobody found with that name.</p>}
      <ul className="people">
        {people.map(person => (
          <li key={person.id}>
            <Link to={`/people/${person.id}`} className="person">
              <Avatar name={person.name} url={person.avatarUrl} />
              <span>
                <strong>{person.name}</strong>
                {person.bio && <span className="small">{person.bio}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
