# Meshwar

A weather-aware outing planner for students in Lebanon. Plan a hike, a beach day or a ski trip, and Meshwar shows the forecast for that exact day and place, with a plain verdict.

> The first proposal spelled the name "Mishwar". It is the same project.

**Team:** Wadih Tawk, Alex Achkar, Raymond El-Helou

## Run it locally

You need Node.js 22.12 or newer and a MongoDB Atlas connection string.

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

In a second terminal:

```bash
cd client
npm install
cp .env.example .env.development
npm run dev
```

Open http://localhost:5173.
