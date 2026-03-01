import { Link } from 'react-router-dom';
import './HomePage.css';

export function HomePage() {
  return (
    <div className="home-page">
      <div className="home-page__container">
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <Link to="/monsters" className="home-page__nav-button" style={{ textAlign: 'center' }}>
                Monsters
              </Link>
              <Link to="/equipment" className="home-page__nav-button" style={{ textAlign: 'center' }}>
                Equipment
              </Link>
              <Link to="/abilities" className="home-page__nav-button" style={{ textAlign: 'center' }}>
                Abilities
              </Link>
            </div>
            <Link to="/campaign-builder" className="home-page__nav-button" style={{ marginTop: '1rem', background: 'var(--burgundy)', color: 'white' }}>
              Campaign Builder
            </Link>
            <Link to="/settings" className="home-page__nav-button" style={{ marginTop: '0.2rem', borderColor: 'var(--ink)' }}>
              Data & Settings
            </Link>
          </nav>
        </main>
      </div>
    </div>
  );
}
