import { Link, useNavigate } from 'react-router-dom';
import { useCharacters } from '../hooks/useCharacters';
import './compendium/Compendium.css';

export function CharactersPage() {
    const { characters, deleteCharacter } = useCharacters();
    const navigate = useNavigate();

    return (
        <div className="compendium-page">
            <header className="page-header">
                <div className="page-header__top">
                    <Link to="/" className="page-header__home-link">← Home</Link>
                    <h1>My Characters</h1>
                </div>
                <p className="page-header__subtitle">Manage your saved heroes</p>
            </header>

            <main className="compendium-page__main" style={{ width: '100%', maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
                {characters.length === 0 ? (
                    <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--parchment) 0%, var(--parchment-dark) 100%)', padding: '3rem 2rem', border: '3px double var(--burgundy)', borderRadius: '4px', color: 'var(--ink)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ fontFamily: '"Cinzel", serif', marginBottom: '1rem' }}>No Characters Found</h2>
                        <p style={{ marginBottom: '2rem', color: 'var(--ink-muted)' }}>You haven't saved any characters yet.</p>
                        <Link to="/character-creation" className="app__finish-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
                            Create a Character
                        </Link>
                    </div>
                ) : (
                    <div className="compendium-list-container" style={{ padding: 0 }}>
                        <div className="compendium-list-header">
                            <span style={{ flex: 2 }}>Name</span>
                            <span style={{ flex: 1 }}>Bloodline</span>
                            <span style={{ flex: 1 }}>Level</span>
                            <span style={{ flex: 1, textAlign: 'right' }}>Actions</span>
                        </div>
                        <ul className="compendium-list">
                            {characters.map(char => (
                                <li
                                    key={char.id}
                                    className="compendium-list-item"
                                >
                                    <div className="compendium-list-item__name" style={{ flex: 2 }}>
                                        <strong style={{ fontFamily: '"Cinzel", serif', fontSize: '1.1rem' }}>{char.name}</strong>
                                    </div>
                                    <div className="compendium-list-item__type" style={{ flex: 1 }}>
                                        {char.bloodline?.name || 'Unknown'}
                                    </div>
                                    <div className="compendium-list-item__cat" style={{ flex: 1 }}>
                                        lvl {char.level}
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', height: '100%' }}>
                                        <button
                                            onClick={() => navigate(`/character/${char.id}`)}
                                            className="app__finish-button character-list-btn"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to delete ${char.name}?`)) {
                                                    deleteCharacter(char.id);
                                                }
                                            }}
                                            className="app__back-button character-list-btn"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
}
