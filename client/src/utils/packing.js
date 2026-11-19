import { COLD_LIMIT, RAIN_LIMIT } from './verdict.js';

const ITEMS = {
  hike: ['Water (2 litres)', 'Hiking shoes', 'Snacks', 'Sunscreen', 'Small first-aid kit'],
  beach: ['Swimsuit', 'Towel', 'Sunscreen', 'Hat or cap', 'Water'],
  ski: ['Ski jacket and trousers', 'Gloves', 'Goggles', 'Warm socks', 'Lip balm'],
  picnic: ['Blanket', 'Food and drinks', 'Plates and cups', 'Rubbish bags'],
  city: ['Comfortable shoes', 'Water', 'Phone charger', 'Some cash'],
  other: ['Water', 'Phone charger', 'Snacks'],
};

export function packingList(activity, forecast) {
  const items = [...(ITEMS[activity] || ITEMS.other)];
  if (forecast && typeof forecast.rainChance === 'number' && forecast.rainChance >= RAIN_LIMIT) {
    items.push('Umbrella or rain jacket');
  }
  if (forecast && typeof forecast.min === 'number' && forecast.min < COLD_LIMIT) {
    items.push('Warm jacket');
  }
  return items;
}
