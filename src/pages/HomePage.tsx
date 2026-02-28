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
        <nav className="home-page__nav" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/how-to-play" className="home-page__nav-button">
            How to Play
          </Link>
          <Link to="/characters" className="home-page__nav-button">
            My Characters
          </Link>
          <Link to="/character-creation" className="home-page__nav-button">
            Character Creation
          </Link>
          <Link to="/monsters" className="home-page__nav-button">
            Monster List
          </Link>
          <Link to="/campaign-builder" className="home-page__nav-button" style={{ marginTop: '1rem', background: 'var(--burgundy)', color: 'white' }}>
            Campaign Builder
          </Link>
        </nav>
      </main>
    </div>
  );
}
