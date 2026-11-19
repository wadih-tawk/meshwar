export const ACTIVITIES = [
  { value: 'hike', label: 'Hike' },
  { value: 'beach', label: 'Beach' },
  { value: 'ski', label: 'Ski' },
  { value: 'picnic', label: 'Picnic' },
  { value: 'city', label: 'City trip' },
  { value: 'other', label: 'Other' },
];

export function activityLabel(value) {
  const activity = ACTIVITIES.find(item => item.value === value);
  return activity ? activity.label : 'Other';
}

export function placeLabel(place) {
  if (!place.country) {
    return place.name;
  }
  return `${place.name}, ${place.country}`;
}
