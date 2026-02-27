import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { monsters, monsterTypes, getMonsterAbilityById, getTraitById, type Monster } from '../data/monsters';
import './MonsterListPage.css';

export function MonsterListPage() {
    const [selectedType, setSelectedType] = useState<string>('All');
    const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null);

    // Filter and sort monsters by level ascending
    const filteredAndSortedMonsters = useMemo(() => {
        const filtered = selectedType === 'All'
            ? monsters
            : monsters.filter((m) => m.monsterType === selectedType);

        return [...filtered].sort((a, b) => a.level - b.level);
    }, [selectedType]);

    const selectedMonster = useMemo(() =>
        monsters.find((m) => m.id === selectedMonsterId) || null
        , [selectedMonsterId]);

    return (
        <div className="monster-page">
            <header className="monster-page__header">
                <div className="monster-page__header-top">
                    <Link to="/" className="monster-page__home-link">← Home</Link>
                    <h1>Monster Archive</h1>
                </div>
                <div className="monster-page__filters">
                    <label htmlFor="type-filter">Filter by Type: </label>
                    <select
                        id="type-filter"
                        value={selectedType}
                        onChange={(e) => {
                            setSelectedType(e.target.value);
                            setSelectedMonsterId(null); // Clear selection on filter change
                        }}
                    >
                        <option value="All">All Types</option>
                        {monsterTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </header>

            <main className="monster-page__main">
                <div className="monster-list-container">
                    <div className="monster-list-header">
                        <span>Name</span>
                        <span>Type</span>
                        <span>Level</span>
                    </div>
                    <ul className="monster-list">
                        {filteredAndSortedMonsters.map((monster) => (
                            <li
                                key={monster.id}
                                className={`monster-list-item ${selectedMonsterId === monster.id ? 'selected' : ''}`}
                                onClick={() => setSelectedMonsterId(monster.id)}
                            >
                                <div className="monster-list-item__name">
                                    <strong>{monster.name}</strong>
                                </div>
                                <div className="monster-list-item__type">{monster.monsterType}</div>
                                <div className="monster-list-item__level">lvl {monster.level}</div>
                            </li>
                        ))}
                        {filteredAndSortedMonsters.length === 0 && (
                            <li className="monster-list-empty">No monsters found for this type.</li>
                        )}
                    </ul>
                </div>

                {selectedMonster && (
                    <div className="monster-detail-container">
                        <div className="monster-detail-overlay" onClick={() => setSelectedMonsterId(null)}></div>
                        <MonsterDetailPanel monster={selectedMonster} onClose={() => setSelectedMonsterId(null)} />
                    </div>
                )}
            </main>
        </div>
    );
}

function MonsterDetailPanel({ monster, onClose }: { monster: Monster, onClose: () => void }) {
    // Try to lookup ability details if they are just standard strings in the `abilities` array.
    // We'll pass the exact strings to getMonsterAbilityById to try and get rich rules text.
    return (
        <div className="monster-detail">
            <button className="monster-detail__close" onClick={onClose}>✕</button>
            <header className="monster-detail__header">
                <h2>{monster.name}</h2>
                <div className="monster-detail__tags">
                    <span className="monster-detail__tag">Level {monster.level}</span>
                    <span className="monster-detail__tag">{monster.monsterType}</span>
                </div>
            </header>

            <div className="monster-detail__content">
                {monster.loreText && (
                    <p className="monster-detail__lore">{monster.loreText}</p>
                )}

                <section className="monster-detail__section">
                    <h3>Stats</h3>
                    <ul className="stats-list">
                        <li><strong>HP:</strong> {monster.hpMax}</li>
                        {monster.armourMax > 0 && <li><strong>Armour:</strong> {monster.armourMax}</li>}
                        {monster.wardMax > 0 && <li><strong>Ward:</strong> {monster.wardMax}</li>}
                    </ul>
                    {['Golem', 'Automaton', 'Titan', 'Land Spirit'].includes(monster.name) && (
                        <div className="monster-detail__note" style={{ marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.9rem' }}>
                            The {monster.name.toLowerCase()} has extra HP equal to its STR bonus.
                        </div>
                    )}
                </section>

                {monster.skills && Object.keys(monster.skills).length > 0 && (
                    <section className="monster-detail__section">
                        <h3>Skills</h3>
                        <div className="skills-grid">
                            {Object.entries(monster.skills).map(([skill, val]) => (
                                <div key={skill} className="skill-box">
                                    <span className="skill-name">{skill}</span>
                                    <span className="skill-val">+{val}</span>
                                </div>
                            ))}
                        </div>
                        {['Cyclops', 'Ogre'].includes(monster.name) && (
                            <div className="monster-detail__note" style={{ marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                The {monster.name.toLowerCase()} has disadvantage on all {monster.name === 'Cyclops' ? 'INS' : 'WIS'} checks.
                            </div>
                        )}
                    </section>
                )}            {
                    monster.traits && monster.traits.length > 0 && (
                        <section className="monster-detail__section">
                            <h3>Traits</h3>
                            <ul className="traits-list">
                                {monster.traits.map((traitId, i) => {
                                    const traitDef = getTraitById(traitId);
                                    const formattedName = traitId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                    return (
                                        <li key={i}>
                                            <strong>{formattedName}</strong>
                                            {traitDef ? `: ${traitDef.rulesText}` : ''}
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    )
                }

                {
                    monster.abilities && monster.abilities.length > 0 && (
                        <section className="monster-detail__section">
                            <h3>Abilities</h3>
                            <ul className="abilities-list">
                                {monster.abilities.map((abilityRef, i) => {
                                    const ability = getMonsterAbilityById(abilityRef);
                                    if (ability) {
                                        return (
                                            <li key={i} className="ability-item">
                                                <strong>{ability.name}</strong>
                                                {ability.check && (
                                                    <div className="ability-check">
                                                        {ability.check.attackerSkill}
                                                        {ability.check.defenderSkill ? ` vs. ${ability.check.defenderSkill}` : ''}
                                                        {ability.check.range || ability.check.area ? ` (` : ''}
                                                        {ability.check.range && `range: ${ability.check.range}`}
                                                        {ability.check.range && ability.check.area ? `, ` : ''}
                                                        {ability.check.area && `area: ${ability.check.area}`}
                                                        {ability.check.range || ability.check.area ? `)` : ''}
                                                    </div>
                                                )}
                                                <div className="ability-text">{ability.rulesText}</div>
                                            </li>
                                        );
                                    }
                                    return <li key={i} className="ability-item"><strong>{abilityRef}</strong></li>;
                                })}
                            </ul>
                        </section>
                    )
                }

                {
                    monster.equipment && monster.equipment.length > 0 && (
                        <section className="monster-detail__section">
                            <h3>Equipment</h3>
                            <ul className="equipment-list">
                                {monster.equipment.map((eq, i) => (
                                    <li key={i} className="equipment-item">
                                        <strong>{eq.name}:</strong> {eq.rulesText}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )
                }
            </div >
        </div >
    );
}
