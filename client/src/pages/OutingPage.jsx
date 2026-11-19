import { useParams } from 'react-router-dom';

export default function OutingPage() {
  const { id } = useParams();
  return <h1>Outing {id}</h1>;
}
