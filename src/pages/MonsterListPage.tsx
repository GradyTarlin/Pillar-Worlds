import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { monsters, monsterTypes } from '../data/monsters';
import { MonsterDetailPanel } from '../components/MonsterDetailPanel';
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
            <header className="page-header">
                <div className="page-header__top">
                    <Link to="/" className="page-header__home-link">← Home</Link>
                    <h1>Monsters</h1>
                </div>
                <p className="page-header__subtitle">Bestiary of creatures and enemies</p>
                <div className="compendium-page__filters">
                    <div className="filter-group">
                        <label htmlFor="type-filter">Filter by Type: </label>
                        <select
                            id="type-filter"
                            className="app__select"
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


