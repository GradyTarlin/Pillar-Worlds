import { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import { ListHeader, EntityCard } from './CampaignShared';
import type { CampaignMonster } from '../../types/campaign';
import { monsters as monsterArchive } from '../../data/monsters';

interface MonstersViewProps {
    locationId: string;
}

export function MonstersView({ locationId }: MonstersViewProps) {
    const { data, updateEntities } = useCampaignData();
    const [editingId, setEditingId] = useState<string | null>(null);

    const filteredMonsters = data.monsters.filter(m => m.dungeonId === locationId);

    const handleAdd = () => {
        // Default to the first monster in the archive to ensure validity
        const baseMonster = monsterArchive[0];

        const newMonster: CampaignMonster = {
            id: `monster_${Date.now()}`,
            dungeonId: locationId,
            monsterId: baseMonster.id,
            name: baseMonster.name,
            notes: ''
        };
        updateEntities('monsters', [...data.monsters, newMonster]);
        setEditingId(newMonster.id);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to remove this monster from the dungeon?')) {
            updateEntities('monsters', data.monsters.filter(m => m.id !== id));
        }
    };

    const handleSave = (updated: CampaignMonster) => {
        updateEntities('monsters', data.monsters.map(m => m.id === updated.id ? updated : m));
        setEditingId(null);
    };

    return (
        <div className="campaign-view-section">
            <ListHeader title="Monsters" onAdd={handleAdd} addLabel="Monster" />

            <div className="campaign-cards-grid">
                {filteredMonsters.map(monster => (
                    editingId === monster.id ? (
                        <MonsterEditForm
                            key={monster.id}
                            monster={monster}
                            onSave={handleSave}
                            onCancel={() => setEditingId(null)}
                        />
                    ) : (
                        <EntityCard
                            key={monster.id}
                            title={monster.name}
                            subtitle={`Base: ${monsterArchive.find(m => m.id === monster.monsterId)?.name || 'Unknown'}`}
                            tags={['MONSTER']}
                            onEdit={() => setEditingId(monster.id)}
                            onDelete={() => handleDelete(monster.id)}
                        >
                            {monster.notes && <p className="campaign-entity-notes"><strong>Behavior/Notes:</strong> {monster.notes}</p>}
                        </EntityCard>
                    )
                ))}
                {filteredMonsters.length === 0 && (
                    <p className="campaign-empty-state">No monsters inhabit this dungeon yet. Click "+ Monster" to populate it.</p>
                )}
            </div>
        </div>
    );
}

function MonsterEditForm({
    monster,
    onSave,
    onCancel
}: {
    monster: CampaignMonster,
    onSave: (m: CampaignMonster) => void,
    onCancel: () => void
}) {
    const [form, setForm] = useState<CampaignMonster>(monster);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => {
            const updated = { ...prev, [name]: value };

            // Auto-update the display name if the base monster changes and they haven't set a custom name
            if (name === 'monsterId') {
                const newBase = monsterArchive.find(m => m.id === value);
                const oldBase = monsterArchive.find(m => m.id === prev.monsterId);
                if (newBase && (!prev.name || prev.name === oldBase?.name)) {
                    updated.name = newBase.name;
                }
            }
            return updated;
        });
    };

    return (
        <div className="campaign-entity-form">
            <h3>Edit Monster Encounter</h3>

            <div className="campaign-form-group">
                <label>Base Monster (Stats/Abilities)</label>
                <select className="app__select" name="monsterId" value={form.monsterId} onChange={handleChange}>
                    {monsterArchive.map(m => (
                        <option key={m.id} value={m.id}>{m.name} (Lvl {m.level})</option>
                    ))}
                </select>
            </div>

            <div className="campaign-form-group">
                <label>Custom Name or Title (Optional)</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Slime, The Obsidian Behemoth" autoFocus />
            </div>

            <div className="campaign-form-group">
                <label>Encounter Notes (Behavior/Loot/Quantity)</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} placeholder="e.g. 3x Goblins guarding the bridge. They will flee if their leader is killed." />
            </div>

            <div className="campaign-form-actions">
                <button className="campaign-btn-secondary" onClick={onCancel}>Cancel</button>
                <button className="campaign-btn-primary" onClick={() => onSave(form)}>Save Monster</button>
            </div>
        </div>
    );
}
