export default function ListPanel({ title, items }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <ul className="tips">
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
