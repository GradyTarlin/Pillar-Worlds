import { Link } from 'react-router-dom';
import './HomePage.css';

export function HomePage() {
  return (
    <div className="home-page">
      <header className="home-page__header">
        <h1>Pillar Worlds</h1>
        <p className="home-page__tagline">A fantasy tabletop roleplaying game</p>
      </header>

      <main className="home-page__main">
        <nav className="home-page__nav">
          <Link to="/character-creation" className="home-page__nav-button">
            Character Creation
          </Link>
        </nav>
      </main>
    </div>
  );
}
