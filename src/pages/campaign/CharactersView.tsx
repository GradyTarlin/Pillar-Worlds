import { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import { ListHeader, EntityCard } from './CampaignShared';
import type { CampaignCharacter } from '../../types/campaign';

export function CharactersView() {
    const { data, updateEntities } = useCampaignData();
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleAdd = () => {
        const newChar: CampaignCharacter = {
            id: `char_${Date.now()}`,
            name: 'New Character',
            description: '',
            type: 'npc',
            level: 1,
            notes: ''
        };
        updateEntities('characters', [...data.characters, newChar]);
        setEditingId(newChar.id);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this character?')) {
            updateEntities('characters', data.characters.filter(c => c.id !== id));
        }
    };

    const handleSave = (updated: CampaignCharacter) => {
        updateEntities('characters', data.characters.map(c => c.id === updated.id ? updated : c));
        setEditingId(null);
    };

    return (
        <div className="campaign-view-section">
            <ListHeader title="Characters & NPCs" onAdd={handleAdd} addLabel="Character" />

            <div className="campaign-cards-grid">
                {data.characters.map(char => (
                    editingId === char.id ? (
                        <CharacterEditForm
                            key={char.id}
                            character={char}
                            onSave={handleSave}
                            onCancel={() => setEditingId(null)}
                        />
                    ) : (
                        <EntityCard
                            key={char.id}
                            title={char.name}
                            subtitle={`Level ${char.level} ${char.classOrRole || char.type.toUpperCase()}`}
                            description={char.description}
                            tags={[char.type.toUpperCase()]}
                            onEdit={() => setEditingId(char.id)}
                            onDelete={() => handleDelete(char.id)}
                        >
                            {char.notes && <p className="campaign-entity-notes"><strong>Notes:</strong> {char.notes}</p>}
                        </EntityCard>
                    )
                ))}
                {data.characters.length === 0 && (
                    <p className="campaign-empty-state">No characters added yet. Click "+ Character" to start.</p>
                )}
            </div>
        </div>
    );
}

function CharacterEditForm({
    character,
    onSave,
    onCancel
}: {
    character: CampaignCharacter,
    onSave: (c: CampaignCharacter) => void,
    onCancel: () => void
}) {
    const [form, setForm] = useState<CampaignCharacter>(character);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: name === 'level' ? parseInt(value) || 1 : value }));
    };

    return (
        <div className="campaign-entity-form">
            <h3>Edit Character</h3>
            <div className="campaign-form-group">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} autoFocus />
            </div>
            <div className="campaign-form-row">
                <div className="campaign-form-group">
                    <label>Type</label>
                    <select name="type" value={form.type} onChange={handleChange}>
                        <option value="pc">Player Character (PC)</option>
                        <option value="npc">Non-Player Character (NPC)</option>
                    </select>
                </div>
                <div className="campaign-form-group">
                    <label>Level</label>
                    <input type="number" name="level" value={form.level} onChange={handleChange} min="1" />
                </div>
            </div>
            <div className="campaign-form-group">
                <label>Class/Role</label>
                <input name="classOrRole" value={form.classOrRole || ''} onChange={handleChange} placeholder="e.g. Fighter, Blacksmith" />
            </div>
            <div className="campaign-form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
            </div>
            <div className="campaign-form-group">
                <label>Private Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} />
            </div>
            <div className="campaign-form-actions">
                <button className="campaign-btn-secondary" onClick={onCancel}>Cancel</button>
                <button className="campaign-btn-primary" onClick={() => onSave(form)}>Save Character</button>
            </div>
        </div>
    );
}
