import { Link, useNavigate } from 'react-router-dom';
import { useCharacters } from '../hooks/useCharacters';
import { deriveSkills, deriveHP } from '../derivation';
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
                    <div style={{ textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: '8px' }}>
                        <p style={{ marginBottom: '1rem' }}>You haven't saved any characters yet.</p>
                        <Link to="/character-creation" className="home-page__nav-button">
                            Create a Character
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {characters.map(char => {
                            const skills = deriveSkills(char, char.skillIncreases);
                            const hp = deriveHP(skills, char.bloodline?.id ?? null, char.extraHp);

                            return (
                                <div key={char.id} style={{
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <h2 style={{ color: 'var(--burgundy)', marginBottom: '0.25rem' }}>{char.name}</h2>
                                        <p style={{ color: 'var(--gold)' }}>Level {char.level} • {char.bloodline?.name}</p>
                                        <p style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '0.5rem' }}>HP: {hp}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button
                                            onClick={() => navigate(`/character/${char.id}`)}
                                            className="home-page__nav-button"
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
                                            className="home-page__nav-button"
                                            style={{ padding: '0.5rem 1rem', margin: 0, backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}
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
