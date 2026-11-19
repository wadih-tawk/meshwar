import { ACTIVITIES } from '../utils/format.js';

export default function ActivityFilter({ outings, selected, onSelect }) {
  const used = ACTIVITIES.filter(activity => outings.some(outing => outing.activity === activity.value));

  if (used.length < 2) {
    return null;
  }

  return (
    <div className="chips">
      <button type="button" className={selected === 'all' ? 'chip chip-active' : 'chip'} aria-pressed={selected === 'all'} onClick={() => onSelect('all')}>
        All
      </button>
      {used.map(activity => (
        <button
          key={activity.value}
          type="button"
          className={selected === activity.value ? 'chip chip-active' : 'chip'}
          aria-pressed={selected === activity.value}
          onClick={() => onSelect(activity.value)}
        >
          {activity.icon} {activity.label}
        </button>
      ))}
    </div>
  );
}
