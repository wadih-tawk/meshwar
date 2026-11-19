const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  if (!API_URL) {
    throw new Error('VITE_API_URL is not set, so the app does not know where the API is.');
  }
  const token = localStorage.getItem('token');
  let res;
  try {
    res = await fetch(API_URL + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:expired'));
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}
