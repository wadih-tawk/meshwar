for (const key of ['MONGODB_URI', 'CLIENT_URL']) {
  if (!process.env[key]) {
    throw new Error(`Missing env var: ${key}`);
  }
}
