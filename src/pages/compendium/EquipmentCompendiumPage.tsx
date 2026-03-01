import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { baseItems, artifacts, type BaseItem, type Artifact } from '../../data/equipment';
import './Compendium.css';

type EquipmentItem = BaseItem | Artifact;

export function EquipmentCompendiumPage() {
    const [selectedType, setSelectedType] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const allEquipment = useMemo(() => {
        return [...baseItems, ...artifacts];
    }, []);

    const equipmentCategories = useMemo(() => {
        const categories: Record<string, Set<string>> = {};

        allEquipment.forEach(item => {
            let mainType = item.type.charAt(0).toUpperCase() + item.type.slice(1);
            let subType = item.subtype || '';

            if (['Armour', 'Shield', 'Ward'].includes(mainType)) {
                subType = mainType;
                mainType = 'Defence';
            }

            if (!categories[mainType]) {
                categories[mainType] = new Set();
            }
            if (subType) {
                categories[mainType].add(subType.charAt(0).toUpperCase() + subType.slice(1));
            }
        });
        return categories;
    }, [allEquipment]);

    const filteredAndSortedItems = useMemo(() => {
        let filtered = allEquipment;

        if (selectedType !== 'All') {
            const isSubtype = selectedType.startsWith('subtype:');
            const isType = selectedType.startsWith('type:');

            filtered = filtered.filter((i) => {
                let mainType = i.type.charAt(0).toUpperCase() + i.type.slice(1);
                let subType = i.subtype ? i.subtype.charAt(0).toUpperCase() + i.subtype.slice(1) : '';

                if (['Armour', 'Shield', 'Ward'].includes(mainType)) {
                    subType = mainType;
                    mainType = 'Defence';
                }

                if (isSubtype) {
                    const [, filterMain, filterSub] = selectedType.split(':');
                    return mainType === filterMain && subType === filterSub;
                } else if (isType) {
                    const [, filterMain] = selectedType.split(':');
                    return mainType === filterMain;
                }
                return true;
            });
        }

        if (searchTerm.trim() !== '') {
            const lowerQuery = searchTerm.toLowerCase();
            filtered = filtered.filter(i => {
                const rtStr = Array.isArray(i.rulesText) ? i.rulesText.join(' ') : i.rulesText;
                return i.name.toLowerCase().includes(lowerQuery) ||
                    rtStr.toLowerCase().includes(lowerQuery);
            });
        }

        return [...filtered].sort((a, b) => {
            const subtypeA = (a.subtype || '').toLowerCase();
            const subtypeB = (b.subtype || '').toLowerCase();
            if (subtypeA < subtypeB) return -1;
            if (subtypeA > subtypeB) return 1;

            return a.name.localeCompare(b.name);
        });
    }, [allEquipment, selectedType, searchTerm]);

    const selectedItem = useMemo(() =>
        allEquipment.find((i) => i.id === selectedItemId) || null
        , [selectedItemId, allEquipment]);

    return (
        <div className="compendium-page">
            <header className="compendium-page__header" style={{ textAlign: 'center' }}>
                <div className="compendium-page__header-top" style={{ justifyContent: 'center', position: 'relative' }}>
                    <Link to="/" className="compendium-page__home-link" style={{ position: 'absolute', left: 0 }}>← Home</Link>
                    <h1>Equipment Archive</h1>
                </div>
                <p className="compendium-page__subtitle" style={{ fontSize: '1.2rem', color: 'var(--ink-muted)', marginTop: '0.25rem', marginBottom: '0.5rem', fontStyle: 'italic' }}>Browse weapons, armour, and items</p>
                <div className="compendium-page__filters" style={{ justifyContent: 'center' }}>
                    <div className="filter-group">
                        <label htmlFor="type-filter">Type: </label>
                        <select
                            id="type-filter"
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value);
                                setSelectedItemId(null);
                            }}
                        >
                            <option value="All">All Equipment</option>
                            {Object.keys(equipmentCategories).sort().map(mainType => (
                                <optgroup key={mainType} label={mainType}>
                                    <option value={`type:${mainType}`}>All {mainType}</option>
                                    {Array.from(equipmentCategories[mainType]).sort().map(sub => (
                                        <option key={`${mainType}:${sub}`} value={`subtype:${mainType}:${sub}`}>
                                            -- {sub}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group focus-search">
                        <input
                            type="text"
                            placeholder="Search equipment..."
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
                        <span>Type</span>
                        <span>Subtype</span>
                        <span>Category</span>
                    </div>
                    <ul className="compendium-list">
                        {filteredAndSortedItems.map((item) => {
                            const isArtifact = !Array.isArray(item.rulesText);
                            return (
                                <li
                                    key={item.id}
                                    className={`compendium-list-item ${selectedItemId === item.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedItemId(item.id)}
                                >
                                    <div className="compendium-list-item__name" style={{ flex: 2 }}>
                                        <strong>{item.name}</strong>
                                        {isArtifact && <span className="tag-artifact">Artifact</span>}
                                    </div>
                                    <div className="compendium-list-item__type">
                                        {['armour', 'shield', 'ward'].includes(item.type) ? 'Defence' : item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                    </div>
                                    <div className="compendium-list-item__subtype">
                                        {['armour', 'shield', 'ward'].includes(item.type)
                                            ? item.type.charAt(0).toUpperCase() + item.type.slice(1)
                                            : (item.subtype ? item.subtype.charAt(0).toUpperCase() + item.subtype.slice(1) : '-')}
                                    </div>
                                    <div className="compendium-list-item__cat">{isArtifact ? 'Artifact' : 'Base'}</div>
                                </li>
                            );
                        })}
                        {filteredAndSortedItems.length === 0 && (
                            <li className="compendium-list-empty">No equipment found.</li>
                        )}
                    </ul>
                </div>

                {selectedItem && (
                    <div className="compendium-detail-container">
                        <div className="compendium-detail-overlay" onClick={() => setSelectedItemId(null)}></div>
                        <EquipmentDetailPanel item={selectedItem} onClose={() => setSelectedItemId(null)} />
                    </div>
                )}
            </main>
        </div>
    );
}

function EquipmentDetailPanel({ item, onClose }: { item: EquipmentItem, onClose: () => void }) {
    const isArtifact = !Array.isArray(item.rulesText);

    return (
        <div className="compendium-detail">
            <button className="compendium-detail__close" onClick={onClose}>✕</button>
            <header className="compendium-detail__header">
                <h2>{item.name}</h2>
                <div className="compendium-detail__tags">
                    <span className="compendium-detail__tag">{item.type}</span>
                    {isArtifact ? (
                        <span className="compendium-detail__tag highlight">Artifact</span>
                    ) : (
                        <span className="compendium-detail__tag">Base Item</span>
                    )}
                </div>
            </header>

            <div className="compendium-detail__content">
                <section className="compendium-detail__section">
                    <h3>Rules</h3>
                    {Array.isArray(item.rulesText) ? (
                        item.rulesText.map((p, i) => <p key={i} className="rules-text">{p}</p>)
                    ) : (
                        <p className="rules-text">{item.rulesText}</p>
                    )}
                </section>

                {isArtifact && (item as Artifact).subtype && (
                    <section className="compendium-detail__section">
                        <h3>Subtype</h3>
                        <p>{(item as Artifact).subtype}</p>
                    </section>
                )}
            </div>
        </div>
    );
}
