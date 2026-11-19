import { useState } from 'react';
import { packingList } from '../utils/packing.js';

function loadChecked(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function PackingList({ outingId, activity, forecast }) {
  const key = `packing-${outingId}`;
  const items = packingList(activity, forecast);
  const [checked, setChecked] = useState(() => loadChecked(key));

  function toggle(item) {
    const next = checked.includes(item) ? checked.filter(name => name !== item) : [...checked, item];
    setChecked(next);
    localStorage.setItem(key, JSON.stringify(next));
  }

  const done = items.filter(item => checked.includes(item)).length;
  const percent = Math.round((done / items.length) * 100);

  return (
    <section className="panel">
      <h2>Packing list</h2>
      <p className="small">
        {done} of {items.length} packed
      </p>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${percent}%` }} />
      </div>
      <ul className="checklist">
        {items.map(item => (
          <li key={item}>
            <label>
              <input type="checkbox" checked={checked.includes(item)} onChange={() => toggle(item)} />
              {item}
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
