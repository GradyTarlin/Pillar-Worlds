import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { allAbilities, type Ability } from '../../data/abilities';
import './Compendium.css';

export function AbilitiesCompendiumPage() {
    const [selectedTag, setSelectedTag] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedAbilityId, setSelectedAbilityId] = useState<string | null>(null);

    const abilityTags = useMemo(() => {
        const tags = new Set(allAbilities.map(a => a.tag));
        return Array.from(tags).sort();
    }, []);

    const filteredAndSortedItems = useMemo(() => {
        let filtered = allAbilities;

        if (selectedTag !== 'All') {
            filtered = filtered.filter((i) => i.tag === selectedTag);
        }

        if (searchTerm.trim() !== '') {
            const lowerQuery = searchTerm.toLowerCase();
            filtered = filtered.filter(i =>
                i.name.toLowerCase().includes(lowerQuery) ||
                i.rulesText.toLowerCase().includes(lowerQuery)
            );
        }

        return [...filtered].sort((a, b) => {
            if (selectedTag !== 'All') {
                const subtreeCompare = (a.subtree || '').localeCompare(b.subtree || '');
                if (subtreeCompare !== 0) return subtreeCompare;
                return (a.tier || 0) - (b.tier || 0);
            }
            return a.name.localeCompare(b.name);
        });
    }, [selectedTag, searchTerm]);

    const selectedAbility = useMemo(() =>
        allAbilities.find((i) => i.id === selectedAbilityId) || null
        , [selectedAbilityId]);

    return (
        <div className="compendium-page">
            <header className="compendium-page__header" style={{ textAlign: 'center' }}>
                <div className="compendium-page__header-top" style={{ justifyContent: 'center', position: 'relative' }}>
                    <Link to="/" className="compendium-page__home-link" style={{ position: 'absolute', left: 0 }}>← Home</Link>
                    <h1>Abilities Archive</h1>
                </div>
                <p className="compendium-page__subtitle" style={{ fontSize: '1.2rem', color: 'var(--ink-muted)', marginTop: '0.25rem', marginBottom: '0.5rem', fontStyle: 'italic' }}>Archive of spells and techniques</p>
                <div className="compendium-page__filters" style={{ justifyContent: 'center' }}>
                    <div className="filter-group">
                        <label htmlFor="tag-filter">Tag: </label>
                        <select
                            id="tag-filter"
                            className="app__select"
                            value={selectedTag}
                            onChange={(e) => {
                                setSelectedTag(e.target.value);
                                setSelectedAbilityId(null);
                            }}
                        >
                            <option value="All">All Tags</option>
                            {abilityTags.map((tag) => (
                                <option key={tag} value={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group focus-search">
                        <input
                            type="text"
                            placeholder="Search abilities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <main className="compendium-page__main">
                <div className="compendium-list-container">
                    <div className="compendium-list-header">
                        <span style={{ flex: 2 }}>Name</span>
                        <span>Tag</span>
                        <span>Prerequisites</span>
                    </div>
                    <ul className="compendium-list">
                        {filteredAndSortedItems.map((ability) => {
                            return (
                                <li
                                    key={ability.id}
                                    className={`compendium-list-item ${selectedAbilityId === ability.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedAbilityId(ability.id)}
                                >
                                    <div className="compendium-list-item__name" style={{ flex: 2 }}>
                                        <strong>{ability.name}</strong>
                                    </div>
                                    <div className="compendium-list-item__type">{ability.tag}</div>
                                    <div className="compendium-list-item__cat">
                                        {!ability.prerequisites || ability.prerequisites.length === 0
                                            ? 'None'
                                            : ability.prerequisites.map(pr => pr.kind === 'level' ? `Lvl ${pr.min}+` : pr.kind === 'ability' ? (allAbilities.find(a => a.id === pr.id)?.name || 'Ability') : 'Other').join(', ')}
                                    </div>
                                </li>
                            );
                        })}
                        {filteredAndSortedItems.length === 0 && (
                            <li className="compendium-list-empty">No abilities found.</li>
                        )}
                    </ul>
                </div>

                {selectedAbility && (
                    <div className="compendium-detail-container">
                        <div className="compendium-detail-overlay" onClick={() => setSelectedAbilityId(null)}></div>
                        <AbilityDetailPanel ability={selectedAbility} onClose={() => setSelectedAbilityId(null)} />
                    </div>
                )}
            </main>
        </div>
    );
}

function AbilityDetailPanel({ ability, onClose }: { ability: Ability, onClose: () => void }) {

    return (
        <div className="compendium-detail">
            <button className="compendium-detail__close" onClick={onClose}>✕</button>
            <header className="compendium-detail__header">
                <h2>{ability.name}</h2>
                <div className="compendium-detail__tags">
                    <span className="compendium-detail__tag highlight">{ability.tag}</span>
                    {ability.tree && <span className="compendium-detail__tag">{ability.tree}</span>}
                </div>
            </header>

            <div className="compendium-detail__content">
                <section className="compendium-detail__section">
                    <h3>Rules</h3>
                    {ability.passive && (
                        <div className="ability-passive-text" style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
                            {ability.passive}
                        </div>
                    )}
                    {ability.mpCost != null && ability.mpCost !== 0 && ability.mpCost !== '0' && (
                        <div className="ability-check-box" style={{ borderColor: '#1976d2', backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
                            <strong style={{ color: '#1976d2' }}>Cost: </strong>
                            <strong>{ability.mpCost} MP</strong>
                        </div>
                    )}
                    {ability.trigger && (
                        <div className="ability-check-box" style={{ borderColor: '#e65100', backgroundColor: 'rgba(230, 81, 0, 0.05)' }}>
                            <strong style={{ color: '#e65100' }}>Trigger: </strong>
                            {ability.trigger}
                        </div>
                    )}
                    {ability.check && (
                        <div className="ability-check-box">
                            <strong>Check: </strong>
                            {ability.check.attackerSkill}
                            {ability.check.defenderSkill ? ` vs. ${ability.check.defenderSkill}` : ''}
                            {formatTarget(ability.check.range, ability.check.area) && (
                                <span className="ability-check-range">
                                    {` [Target: ${formatTarget(ability.check.range, ability.check.area)}]`}
                                </span>
                            )}
                        </div>
                    )}
                    <p className="rules-text">{ability.rulesText}</p>
                </section>

                {ability.prerequisites && ability.prerequisites.length > 0 && (
                    <section className="compendium-detail__section">
                        <h3>Prerequisites</h3>
                        <ul className="prereq-list">
                            {ability.prerequisites.map((pr, i) => (
                                <li key={i}>
                                    {pr.kind === 'level' ? `Level ${pr.min}+` :
                                        pr.kind === 'ability' ? `Requires ${allAbilities.find(a => a.id === pr.id)?.name || 'an ability'}` :
                                            `Other requirement`}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </div>
    );
}

function formatTarget(range?: string | null, area?: string | null): string {
    if (area) {
        switch (area) {
            case 'see': return 'Every creature you can see';
            case 'reach': return 'Every creature within your reach';
            case 'zone': return 'A zone you can see';
            case 'twoAdjacentZones': return 'Two adjacent zones';
            case 'boundSpirits': return 'Every enemy whose spirit you have bound';
            default: return area;
        }
    }
    if (range) {
        switch (range) {
            case 'see': return 'A creature you can see';
            case 'reach': return 'A creature within your reach';
            default: return range;
        }
    }
    return '';
}
