import { useState } from 'react';
import PlaceSearch from './PlaceSearch.jsx';
import { ACTIVITIES } from '../utils/format.js';
import { isPast } from '../utils/dates.js';

const EMPTY = { title: '', activity: 'hike', date: '', notes: '', place: null };

function validate(values, initialDate) {
  const errors = {};
  const title = values.title.trim();
  if (!title) {
    errors.title = 'Give the outing a title';
  } else if (title.length > 80) {
    errors.title = 'Keep the title to 80 characters or less';
  }
  if (!values.place) {
    errors.place = 'Search for a place and pick one from the list';
  }
  if (!values.date) {
    errors.date = 'Pick a date';
  } else if (isPast(values.date) && values.date !== initialDate) {
    errors.date = 'Pick today or a later day';
  }
  if (values.notes.length > 500) {
    errors.notes = 'Keep the notes to 500 characters or less';
  }
  return errors;
}

export default function OutingForm({ initial = EMPTY, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues(current => ({ ...current, [name]: value }));
  }

  function handlePick(place) {
    setValues(current => ({ ...current, place }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(values, initial.date);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return;
    }
    setSaving(true);
    setServerError('');
    try {
      await onSubmit({
        title: values.title.trim(),
        activity: values.activity,
        place: values.place,
        date: values.date,
        notes: values.notes.trim(),
      });
    } catch (err) {
      setServerError(err.message);
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" value={values.title} onChange={handleChange} maxLength={80} placeholder="Hike in Qadisha Valley" />
        {errors.title && <p className="field-error">{errors.title}</p>}
      </div>

      <div className="field">
        <label htmlFor="activity">Activity</label>
        <select id="activity" name="activity" value={values.activity} onChange={handleChange}>
          {ACTIVITIES.map(activity => (
            <option key={activity.value} value={activity.value}>
              {activity.label}
            </option>
          ))}
        </select>
      </div>

      <PlaceSearch selected={values.place} onPick={handlePick} error={errors.place} />

      <div className="field">
        <label htmlFor="date">Date</label>
        <input id="date" name="date" type="date" value={values.date} onChange={handleChange} />
        {errors.date && <p className="field-error">{errors.date}</p>}
      </div>

      <div className="field">
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" rows={4} value={values.notes} onChange={handleChange} maxLength={500} placeholder="Who is coming, what to bring…" />
        <p className="small">{values.notes.length}/500</p>
        {errors.notes && <p className="field-error">{errors.notes}</p>}
      </div>

      {serverError && (
        <p className="error" role="alert">
          {serverError}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="button" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="button button-quiet" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
