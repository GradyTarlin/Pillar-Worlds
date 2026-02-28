import { Link, useNavigate } from 'react-router-dom';
import { useCharacters } from '../hooks/useCharacters';

import './HomePage.css'; // Let's reuse some of the homepage styles for simplicity, or we can add specific ones

export function CharactersPage() {
    const { characters, deleteCharacter } = useCharacters();
    const navigate = useNavigate();

    return (
        <div className="home-page" style={{ alignItems: 'flex-start', padding: '2rem' }}>
            <header className="home-page__header" style={{ marginBottom: '2rem' }}>
                <h1>My Characters</h1>
                <Link to="/" className="home-page__nav-button" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1rem' }}>
                    ← Back to Home
                </Link>
            </header>

            <main className="home-page__main" style={{ width: '100%', maxWidth: '800px' }}>
                {characters.length === 0 ? (
                    <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--parchment) 0%, var(--parchment-dark) 100%)', padding: '3rem 2rem', border: '3px double var(--burgundy)', borderRadius: '4px', color: 'var(--ink)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ fontFamily: '"Cinzel", serif', marginBottom: '1rem' }}>No Characters Found</h2>
                        <p style={{ marginBottom: '2rem', color: 'var(--ink-muted)' }}>You haven't saved any characters yet.</p>
                        <Link to="/character-creation" className="app__finish-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
                            Create a Character
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {characters.map(char => {
                            return (
                                <div key={char.id} style={{
                                    background: 'linear-gradient(135deg, var(--parchment) 0%, var(--parchment-dark) 100%)',
                                    border: '3px double var(--burgundy)',
                                    borderRadius: '4px',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                                }}>
                                    <div>
                                        <h2 style={{ color: 'var(--ink)', marginBottom: '0.25rem', fontFamily: '"Cinzel", serif' }}>{char.name}</h2>
                                        <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic', fontWeight: 'bold', margin: '0' }}>Level {char.level} • {char.bloodline?.name}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button
                                            onClick={() => navigate(`/character/${char.id}`)}
                                            className="app__finish-button"
                                            style={{ padding: '0.5rem 1rem', margin: 0 }}
                                        >
                                            View Sheet
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to delete ${char.name}?`)) {
                                                    deleteCharacter(char.id);
                                                }
                                            }}
                                            className="app__back-button"
                                            style={{ padding: '0.5rem 1rem', margin: 0 }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
