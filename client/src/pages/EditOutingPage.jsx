import { useParams } from 'react-router-dom';

export default function EditOutingPage() {
  const { id } = useParams();
  return <h1>Edit outing {id}</h1>;
}
