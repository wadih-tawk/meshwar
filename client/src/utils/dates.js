import dayjs from 'dayjs';

export function today() {
  return dayjs().format('YYYY-MM-DD');
}

export function isPast(date) {
  return date < today();
}

export function formatDate(date) {
  return dayjs(date).format('ddd D MMM YYYY');
}

export function formatShortDate(date) {
  return dayjs(date).format('ddd D MMM');
}
