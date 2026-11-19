import 'dotenv/config';
import './config.js';
import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 3000;

mongoose.set('sanitizeFilter', true);

try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('connected to MongoDB');
} catch (err) {
  console.error('DB connection failed:', err.message);
  process.exit(1);
}

app.listen(PORT, err => {
  if (err) {
    console.error(`Could not listen on port ${PORT}: ${err.message}`);
    process.exit(1);
  }
  console.log(`API on ${PORT}`);
});
