import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { monsters, monsterTypes, getMonsterAbilityById, getTraitById, type Monster } from '../data/monsters';
import './compendium/Compendium.css';

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
        <div className="compendium-page">
            <header className="compendium-page__header">
                <div className="compendium-page__header-top">
                    <Link to="/" className="compendium-page__home-link">← Home</Link>
                    <h1>Monster Archive</h1>
                </div>
                <div className="compendium-page__filters">
                    <div className="filter-group">
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
                </div>
            </header>

            <main className="compendium-page__main">
                <div className="compendium-list-container">
                    <div className="compendium-list-header">
                        <span style={{ flex: 2 }}>Name</span>
                        <span style={{ flex: 1 }}>Type</span>
                        <span style={{ flex: 1 }}>Level</span>
                    </div>
                    <ul className="compendium-list">
                        {filteredAndSortedMonsters.map((monster) => (
                            <li
                                key={monster.id}
                                className={`compendium-list-item ${selectedMonsterId === monster.id ? 'selected' : ''}`}
                                onClick={() => setSelectedMonsterId(monster.id)}
                            >
                                <div className="compendium-list-item__name" style={{ flex: 2 }}>
                                    <strong>{monster.name}</strong>
                                </div>
                                <div className="compendium-list-item__type" style={{ flex: 1 }}>{monster.monsterType}</div>
                                <div className="compendium-list-item__cat" style={{ flex: 1 }}>lvl {monster.level}</div>
                            </li>
                        ))}
                        {filteredAndSortedMonsters.length === 0 && (
                            <li className="compendium-list-empty">No monsters found for this type.</li>
                        )}
                    </ul>
                </div>

                {selectedMonster && (
                    <div className="compendium-detail-container">
                        <div className="compendium-detail-overlay" onClick={() => setSelectedMonsterId(null)}></div>
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
        <div className="compendium-detail">
            <button className="compendium-detail__close" onClick={onClose}>✕</button>
            <header className="compendium-detail__header">
                <h2>{monster.name}</h2>
                <div className="compendium-detail__tags">
                    <span className="compendium-detail__tag highlight">Level {monster.level}</span>
                    <span className="compendium-detail__tag">{monster.monsterType}</span>
                </div>
            </header>

            <div className="compendium-detail__content">
                {monster.loreText && (
                    <p className="compendium-detail__lore">{monster.loreText}</p>
                )}

                <section className="compendium-detail__section">
                    <h3>Stats</h3>
                    <ul className="monster-stats-list">
                        <li><strong>HP:</strong> {monster.hpMax}</li>
                        {monster.armourMax > 0 && <li><strong>Armour:</strong> {monster.armourMax}</li>}
                        {monster.wardMax > 0 && <li><strong>Ward:</strong> {monster.wardMax}</li>}
                    </ul>
                    {['Golem', 'Automaton', 'Titan', 'Land Spirit'].includes(monster.name) && (
                        <div className="compendium-detail__note">
                            The {monster.name.toLowerCase()} has extra HP equal to its STR bonus.
                        </div>
                    )}
                </section>

                {monster.skills && Object.keys(monster.skills).length > 0 && (
                    <section className="compendium-detail__section">
                        <h3>Skills</h3>
                        <div className="monster-skills-grid">
                            {Object.entries(monster.skills).map(([skill, val]) => (
                                <div key={skill} className="monster-skill-box">
                                    <span className="monster-skill-name">{skill}</span>
                                    <span className="monster-skill-val">+{val}</span>
                                </div>
                            ))}
                        </div>
                        {['Cyclops', 'Ogre'].includes(monster.name) && (
                            <div className="compendium-detail__note">
                                The {monster.name.toLowerCase()} has disadvantage on all {monster.name === 'Cyclops' ? 'INS' : 'WIS'} checks.
                            </div>
                        )}
                    </section>
                )}            {
                    monster.traits && monster.traits.length > 0 && (
                        <section className="compendium-detail__section">
                            <h3>Traits</h3>
                            <ul className="monster-traits-list">
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
                        <section className="compendium-detail__section">
                            <h3>Abilities</h3>
                            <ul className="monster-abilities-list">
                                {monster.abilities.map((abilityRef, i) => {
                                    const ability = getMonsterAbilityById(abilityRef);
                                    if (ability) {
                                        return (
                                            <li key={i} className="monster-ability-item">
                                                <strong>{ability.name}</strong>
                                                {ability.check && (
                                                    <div className="monster-ability-check">
                                                        {ability.check.attackerSkill}
                                                        {ability.check.defenderSkill ? ` vs. ${ability.check.defenderSkill}` : ''}
                                                        {ability.check.range || ability.check.area ? ` (` : ''}
                                                        {ability.check.range && `range: ${ability.check.range}`}
                                                        {ability.check.range && ability.check.area ? `, ` : ''}
                                                        {ability.check.area && `area: ${ability.check.area}`}
                                                        {ability.check.range || ability.check.area ? `)` : ''}
                                                    </div>
                                                )}
                                                <div className="monster-ability-text">{ability.rulesText}</div>
                                            </li>
                                        );
                                    }
                                    return <li key={i} className="monster-ability-item"><strong>{abilityRef}</strong></li>;
                                })}
                            </ul>
                        </section>
                    )
                }

                {
                    monster.equipment && monster.equipment.length > 0 && (
                        <section className="compendium-detail__section">
                            <h3>Equipment</h3>
                            <ul className="monster-equipment-list">
                                {monster.equipment.map((eq, i) => (
                                    <li key={i} className="monster-equipment-item">
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
