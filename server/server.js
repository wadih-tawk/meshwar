import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, err => {
  if (err) {
    console.error(`Could not listen on port ${PORT}: ${err.message}`);
    process.exit(1);
  }
  console.log(`API on ${PORT}`);
});
