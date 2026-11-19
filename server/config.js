for (const key of ['MONGODB_URI']) {
  if (!process.env[key]) {
    throw new Error(`Missing env var: ${key}`);
  }
}
