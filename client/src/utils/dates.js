import dayjs from 'dayjs';

export const FORECAST_DAYS = 14;

export function today() {
  return dayjs().format('YYYY-MM-DD');
}

export function isPast(date) {
  return date < today();
}

export function lastForecastDay() {
  return dayjs().add(FORECAST_DAYS, 'day').format('YYYY-MM-DD');
}

export function availableFrom(date) {
  return dayjs(date).subtract(FORECAST_DAYS, 'day').format('YYYY-MM-DD');
}

export function forecastTiming(date) {
  if (isPast(date)) {
    return 'past';
  }
  if (date > lastForecastDay()) {
    return 'later';
  }
  return 'ready';
}

export function formatDate(date) {
  return dayjs(date).format('ddd D MMM YYYY');
}

export function formatShortDate(date) {
  return dayjs(date).format('ddd D MMM');
}

export function nextSaturday() {
  const now = dayjs();
  const daysToGo = (6 - now.day() + 7) % 7;
  return now.add(daysToGo, 'day').format('YYYY-MM-DD');
}

export function countdownLabel(date) {
  const days = dayjs(date).diff(dayjs(today()), 'day');
  if (days === 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Tomorrow';
  }
  return `In ${days} days`;
}

export function timeAgo(moment, now = dayjs()) {
  const minutes = dayjs(now).diff(dayjs(moment), 'minute');
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) {
    return 'yesterday';
  }
  if (days < 7) {
    return `${days} days ago`;
  }
  return dayjs(moment).format('D MMM YYYY');
}
