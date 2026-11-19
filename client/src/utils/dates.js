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
