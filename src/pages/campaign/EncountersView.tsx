import { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import { ListHeader, EntityCard } from './CampaignShared';
import type { Encounter, EncounterCombatant } from '../../types/campaign';
import { monsters as monsterArchive, monsterTypes } from '../../data/monsters';
import './EncountersView.css';

export function EncountersView() {
    const { data, updateEntities } = useCampaignData();
    const [prepEncounterId, setPrepEncounterId] = useState<string | null>(null);
    const [runEncounterId, setRunEncounterId] = useState<string | null>(null);

    // Tracker State
    const [newCombatantName, setNewCombatantName] = useState('');
    const [newCombatantHp, setNewCombatantHp] = useState<number | ''>('');
    const [newCombatantInit, setNewCombatantInit] = useState<number | ''>('');

    // Bestiary State
    const [monsterTypeFilter, setMonsterTypeFilter] = useState<string>('All');
    const [monsterLevelFilter, setMonsterLevelFilter] = useState<string>('All');
    const [selectedMonsterId, setSelectedMonsterId] = useState<string>('');
    const [monsterCount, setMonsterCount] = useState<number>(1);

    const encounters = data.encounters || [];

    const filteredMonsters = Array.from(monsterArchive).filter(m => {
        if (monsterTypeFilter !== 'All' && m.monsterType !== monsterTypeFilter) return false;
        if (monsterLevelFilter !== 'All' && m.level.toString() !== monsterLevelFilter) return false;
        return true;
    }).sort((a, b) => a.name.localeCompare(b.name));

    const handleAddEncounter = () => {
        const newEncounter: Encounter = {
            id: `enc_${Date.now()}`,
            name: 'New Encounter',
            description: '',
            combatants: [],
            round: 1,
            activeTurnIndex: 0,
            isFinished: false,
        };

        updateEntities('encounters', [...encounters, newEncounter]);
        setPrepEncounterId(newEncounter.id);
    };

    const handleDeleteEncounter = (id: string) => {
        updateEntities('encounters', encounters.filter(e => e.id !== id));
        if (prepEncounterId === id) setPrepEncounterId(null);
        if (runEncounterId === id) setRunEncounterId(null);
    };

    const runEncounter = encounters.find(e => e.id === runEncounterId);
    const prepEncounter = encounters.find(e => e.id === prepEncounterId);
    const activeEncounter = runEncounter || prepEncounter;

    const handleUpdateActiveEncounter = (updated: Encounter) => {
        updateEntities('encounters', encounters.map(e => e.id === updated.id ? updated : e));
    };

    const handleAddCombatant = () => {
        if (!activeEncounter || !newCombatantName || newCombatantHp === '' || newCombatantInit === '') return;

        const newCombatant: EncounterCombatant = {
            id: `comb_${Date.now()}`,
            name: newCombatantName,
            isCharacter: false,
            entityId: '',
            initiative: Number(newCombatantInit),
            hp: Number(newCombatantHp),
            maxHp: Number(newCombatantHp),
            statusEffects: [],
        };

        const newCombatants = [...activeEncounter.combatants, newCombatant];
        newCombatants.sort((a, b) => b.initiative - a.initiative); // Sort descending

        handleUpdateActiveEncounter({
            ...activeEncounter,
            combatants: newCombatants
        });

        setNewCombatantName('');
        setNewCombatantHp('');
        setNewCombatantInit('');
    };

    const handleAddFromBestiary = () => {
        if (!activeEncounter || !selectedMonsterId) return;
        const baseMonster = monsterArchive.find(m => m.id === selectedMonsterId);
        if (!baseMonster) return;

        const newCombatants: EncounterCombatant[] = [];
        for (let i = 0; i < monsterCount; i++) {
            newCombatants.push({
                id: `comb_${Date.now()}_${i}`,
                name: monsterCount > 1 ? `${baseMonster.name} ${i + 1}` : baseMonster.name,
                isCharacter: false,
                entityId: baseMonster.id,
                initiative: 0,
                hp: baseMonster.hpMax,
                maxHp: baseMonster.hpMax,
                statusEffects: [],
            });
        }

        const newCombatantsList = [...activeEncounter.combatants, ...newCombatants];
        newCombatantsList.sort((a, b) => b.initiative - a.initiative);

        handleUpdateActiveEncounter({
            ...activeEncounter,
            combatants: newCombatantsList
        });
    };

    const handleNextTurn = () => {
        if (!activeEncounter || activeEncounter.combatants.length === 0) return;
        let nextIndex = activeEncounter.activeTurnIndex + 1;
        let nextRound = activeEncounter.round;
        if (nextIndex >= activeEncounter.combatants.length) {
            nextIndex = 0;
            nextRound += 1;
        }
        handleUpdateActiveEncounter({
            ...activeEncounter,
            activeTurnIndex: nextIndex,
            round: nextRound
        });
    };

    const handleUpdateHp = (combatantId: string, delta: number) => {
        if (!activeEncounter) return;
        const newCombatants = activeEncounter.combatants.map(c =>
            c.id === combatantId ? { ...c, hp: Math.max(0, Math.min(c.maxHp, c.hp + delta)) } : c
        );
        handleUpdateActiveEncounter({
            ...activeEncounter,
            combatants: newCombatants
        });
    };

    const handleRemoveCombatant = (combatantId: string) => {
        if (!activeEncounter) return;
        const newCombatants = activeEncounter.combatants.filter(c => c.id !== combatantId);
        let newIndex = activeEncounter.activeTurnIndex;
        if (newIndex >= newCombatants.length) newIndex = Math.max(0, newCombatants.length - 1);
        handleUpdateActiveEncounter({
            ...activeEncounter,
            combatants: newCombatants,
            activeTurnIndex: newIndex
        });
    };

    if (runEncounter) {
        return (
            <div className="campaign-view-section encounters-view">
                <div className="campaign-list-header">
                    <h2>{runEncounter.name} (Running)</h2>
                    <button className="campaign-btn-secondary" onClick={() => setRunEncounterId(null)}>← End Encounter</button>
                </div>
                <div className="encounter-content" style={{ marginTop: '1rem' }}>
                    <div className="encounter-topbar">
                        <span className="encounter-round">Round: {runEncounter.round}</span>
                        <button className="campaign-btn-primary" onClick={handleNextTurn}>Next Turn ➔</button>
                    </div>

                    <div className="tracker-list">
                        {runEncounter.combatants.length === 0 ? (
                            <div className="campaign-empty-state">No combatants. Prep the encounter first!</div>
                        ) : (
                            runEncounter.combatants.map((combatant, idx) => {
                                const isActive = idx === runEncounter.activeTurnIndex;
                                return (
                                    <div key={combatant.id} className={`tracker-item ${isActive ? 'tracker-item--active' : ''}`}>
                                        <div className="tracker-item-info">
                                            <span className="tracker-init">{combatant.initiative}</span>
                                            <span className="tracker-name">{combatant.name}</span>
                                        </div>
                                        <div className="tracker-item-stats">
                                            <div className="tracker-hp-control">
                                                <button className="hp-btn" onClick={() => handleUpdateHp(combatant.id, -1)}>-1</button>
                                                <span className="tracker-hp">{combatant.hp} / {combatant.maxHp}</span>
                                                <button className="hp-btn" onClick={() => handleUpdateHp(combatant.id, 1)}>+1</button>
                                            </div>
                                            <button className="campaign-btn campaign-btn-danger campaign-btn-small" onClick={() => handleRemoveCombatant(combatant.id)}>✕</button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (prepEncounter) {
        return (
            <div className="campaign-view-section encounters-view">
                <div className="campaign-list-header">
                    <h2>Prep Encounter</h2>
                    <button className="campaign-btn-primary" onClick={() => setPrepEncounterId(null)}>Done</button>
                </div>

                <div className="campaign-entity-form">
                    <div className="campaign-form-group">
                        <label>Encounter Name</label>
                        <input
                            type="text"
                            value={prepEncounter.name}
                            onChange={(e) => handleUpdateActiveEncounter({ ...prepEncounter, name: e.target.value })}
                            placeholder="e.g. Goblin Ambush"
                        />
                    </div>
                </div>

                <div className="encounter-content" style={{ marginTop: '1rem' }}>
                    <div className="tracker-add-section">
                        <div className="tracker-add-row bestiary-row">
                            <strong style={{ width: '80px' }}>Bestiary:</strong>
                            <select value={monsterTypeFilter} onChange={e => { setMonsterTypeFilter(e.target.value); setSelectedMonsterId(''); }}>
                                <option value="All">All Types</option>
                                {monsterTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select value={monsterLevelFilter} onChange={e => { setMonsterLevelFilter(e.target.value); setSelectedMonsterId(''); }}>
                                <option value="All">All Levels</option>
                                {Array.from(new Set(monsterArchive.map(m => m.level))).sort((a, b) => a - b).map(l => <option key={l} value={l.toString()}>Lvl {l}</option>)}
                            </select>
                            <select value={selectedMonsterId} onChange={e => setSelectedMonsterId(e.target.value)} style={{ flex: 1 }}>
                                <option value="" disabled>Select Monster...</option>
                                {filteredMonsters.map(m => <option key={m.id} value={m.id}>{m.name} (Lvl {m.level})</option>)}
                            </select>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Qty:</span>
                            <input type="number" min="1" max="20" value={monsterCount} onChange={e => setMonsterCount(Math.max(1, parseInt(e.target.value) || 1))} className="short-input" title="Quantity" />
                            <button className="campaign-btn" onClick={handleAddFromBestiary} disabled={!selectedMonsterId}>Add</button>
                        </div>

                        <div className="tracker-add-row custom-row">
                            <strong style={{ width: '80px' }}>Custom:</strong>
                            <input
                                type="text"
                                placeholder="Name"
                                value={newCombatantName}
                                onChange={e => setNewCombatantName(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <input
                                type="number"
                                className="short-input"
                                placeholder="HP"
                                value={newCombatantHp}
                                onChange={e => setNewCombatantHp(e.target.value === '' ? '' : Number(e.target.value))}
                            />
                            <input
                                type="number"
                                className="short-input"
                                placeholder="Init"
                                value={newCombatantInit}
                                onChange={e => setNewCombatantInit(e.target.value === '' ? '' : Number(e.target.value))}
                            />
                            <button className="campaign-btn" onClick={handleAddCombatant}>Add</button>
                        </div>
                    </div>

                    <div className="tracker-list">
                        {prepEncounter.combatants.length === 0 ? (
                            <div className="campaign-empty-state">No combatants added yet.</div>
                        ) : (
                            prepEncounter.combatants.map((combatant) => (
                                <div key={combatant.id} className="tracker-item">
                                    <div className="tracker-item-info">
                                        <span className="tracker-init">{combatant.initiative}</span>
                                        <span className="tracker-name">{combatant.name}</span>
                                    </div>
                                    <div className="tracker-item-stats">
                                        <div className="tracker-hp-control" style={{ pointerEvents: 'none' }}>
                                            <span className="tracker-hp">{combatant.hp} / {combatant.maxHp}</span>
                                        </div>
                                        <button className="campaign-btn campaign-btn-danger campaign-btn-small" onClick={() => handleRemoveCombatant(combatant.id)}>✕</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="campaign-view-section encounters-view">
            <ListHeader title="Encounters" onAdd={handleAddEncounter} addLabel="Encounter" />

            <div className="campaign-cards-grid">
                {encounters.length === 0 ? (
                    <p className="campaign-empty-state">No encounters planned.</p>
                ) : (
                    encounters.map(encounter => (
                        <EntityCard
                            key={encounter.id}
                            title={encounter.name}
                            onEdit={() => setPrepEncounterId(encounter.id)}
                            onDelete={() => handleDeleteEncounter(encounter.id)}
                            editIcon="⚔️"
                        >
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--ink)' }}>
                                <button className="campaign-btn-primary" style={{ width: '100%' }} onClick={() => setRunEncounterId(encounter.id)}>
                                    Run Encounter
                                </button>
                            </div>
                        </EntityCard>
                    ))
                )}
            </div>
        </div>
    );
}
