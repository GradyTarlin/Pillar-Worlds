import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCharacters } from '../hooks/useCharacters';
import { CharacterSheet } from '../components/CharacterSheet';
import { LevelUpModal } from '../components/LevelUpModal';
import { deriveSkills } from '../derivation';

export function CharacterViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { characters, updateCharacter } = useCharacters();
    const [showLevelUp, setShowLevelUp] = useState(false);

    const character = characters.find(c => c.id === id);

    if (!character) {
        return (
            <div className="app-sheet-view" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <h2>Character Not Found</h2>
                <p style={{ marginTop: '1rem', marginBottom: '2rem' }}>The character you're trying to view doesn't exist or has been deleted.</p>
                <button onClick={() => navigate('/characters')} className="app__back-button">
                    Back to Characters
                </button>
            </div>
        );
    }

    const skills = deriveSkills(character, character.skillIncreases);

    return (
        <div className="app-sheet-view">
            {/* We pass the saved character into the CharacterSheet so it can render leveled stats */}
            <CharacterSheet
                selections={character}
                skills={skills}
                savedCharacter={character}
                onUpdateCharacter={(updates) => updateCharacter(character.id, updates)}
            />

            <div className="app__back-actions">
                <button type="button" className="app__finish-button" onClick={() => setShowLevelUp(true)}>
                    Level Up
                </button>
                <button type="button" className="app__back-button" onClick={() => navigate('/characters')}>
                    Back to Characters
                </button>
            </div>

            {showLevelUp && (
                <LevelUpModal
                    character={character}
                    onClose={() => setShowLevelUp(false)}
                    onSave={(updates) => {
                        updateCharacter(character.id, updates);
                        setShowLevelUp(false);
                    }}
                />
            )}
        </div>
    );
}
