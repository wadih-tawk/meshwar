import { Link, useNavigate, useParams } from 'react-router-dom';
import OutingForm from '../components/OutingForm.jsx';
import { apiFetch } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';

export default function EditOutingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: outing, loading, error } = useApi(`/api/outings/${id}`);

  async function handleSave(data) {
    await apiFetch(`/api/outings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    navigate(`/outings/${id}`);
  }

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

  const initial = {
    title: outing.title,
    activity: outing.activity,
    place: outing.place,
    date: outing.date,
    notes: outing.notes,
  };

  return (
    <>
      <h1>Edit outing</h1>
      <OutingForm initial={initial} submitLabel="Save changes" onSubmit={handleSave} onCancel={() => navigate(`/outings/${id}`)} />
    </>
  );
}
