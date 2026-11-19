import { Link } from 'react-router-dom';
import { firstName, greeting } from '../utils/greeting.js';

export default function HomeHero({ name }) {
  const hello = greeting(new Date().getHours());
  const who = firstName(name);

  return (
    <section className="hero">
      <p className="hero-kicker">{who ? `${hello}, ${who} 👋` : `${hello} 👋`}</p>
      <h1>Where are we going next?</h1>
      <p className="hero-text">
        Meshwar keeps your outings in one place and checks the sky for you. Pick a place and a day, and we tell you whether to
        pack sunscreen, a jacket or an umbrella.
      </p>
      <div className="hero-actions">
        <Link to="/outings/new" className="button button-light">
          + Plan an outing
        </Link>
        <a href="#ideas" className="button button-ghost">
          Get ideas
        </a>
      </div>
    </section>
  );
}
