import { Link, useParams } from 'react-router-dom';
import OutingDetails from '../components/OutingDetails.jsx';
import { useApi } from '../hooks/useApi.js';

export default function OutingPage() {
  const { id } = useParams();
  const { data: outing, loading, error } = useApi(`/api/outings/${id}`);

  if (loading) {
    return <p className="status">Loading the outing…</p>;
  }

  if (error) {
    return (
      <div className="status" role="alert">
        <h1>Could not open this outing</h1>
        <p className="muted">{error.message}</p>
        <Link to="/outings" className="button button-quiet">
          Back to my outings
        </Link>
      </div>
    );
  }

  return <OutingDetails outing={outing} />;
}
