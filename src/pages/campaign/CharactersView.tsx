import { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import { ListHeader, EntityCard } from './CampaignShared';
import type { CampaignCharacter } from '../../types/campaign';
import { BLOODLINES } from '../../ruleData';

interface CharactersViewProps {
    locationId?: string;
}

export function CharactersView({ locationId }: CharactersViewProps) {
    const { data, updateEntities } = useCampaignData();
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleAdd = () => {
        const newChar: CampaignCharacter = {
            id: `char_${Date.now()}`,
            name: 'New Character',
            description: '',
            notes: '',
            locationId
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

    const filteredCharacters = locationId
        ? data.characters.filter(c => c.locationId === locationId)
        : data.characters;

    return (
        <div className="campaign-view-section">
            <ListHeader title="Characters & NPCs" onAdd={handleAdd} addLabel="Character" />

            <div className="campaign-cards-grid">
                {filteredCharacters.map(char => (
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
                            subtitle={char.role}
                            description={char.description}
                            tags={char.bloodlineId
                                ? [BLOODLINES.find(b => b.id === char.bloodlineId)?.name || 'Unknown Bloodline']
                                : []}
                            onEdit={() => setEditingId(char.id)}
                            onDelete={() => handleDelete(char.id)}
                        >
                            {char.affiliation && <p className="campaign-entity-notes"><strong>Affiliation:</strong> {char.affiliation}</p>}
                            {char.goal && <p className="campaign-entity-notes"><strong>Goal:</strong> {char.goal}</p>}
                            {char.plan && <p className="campaign-entity-notes"><strong>Plan:</strong> {char.plan}</p>}
                            {char.notes && <p className="campaign-entity-notes" style={{ marginTop: '0.5rem' }}><strong>Notes:</strong> {char.notes}</p>}
                        </EntityCard>
                    )
                ))}
                {filteredCharacters.length === 0 && (
                    <p className="campaign-empty-state">No characters added here yet. Click "+ Character" to start.</p>
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
        setForm(prev => ({ ...prev, [name]: value }));
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
                    <label>Bloodline</label>
                    <select name="bloodlineId" value={form.bloodlineId || ''} onChange={handleChange}>
                        <option value="">-- Unknown / None --</option>
                        {Object.entries(
                            BLOODLINES.reduce((acc, b) => {
                                const type = b.type || 'Other';
                                if (!acc[type]) acc[type] = [];
                                acc[type].push(b);
                                return acc;
                            }, {} as Record<string, typeof BLOODLINES>)
                        ).map(([type, lines]) => (
                            <optgroup key={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
                                {lines.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>
                <div className="campaign-form-group">
                    <label>Role</label>
                    <input name="role" value={form.role || ''} onChange={handleChange} placeholder="e.g. Fighter, Blacksmith" />
                </div>
            </div>
            <div className="campaign-form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
            </div>
            <div className="campaign-form-group">
                <label>Affiliation / Faction</label>
                <input name="affiliation" value={form.affiliation || ''} onChange={handleChange} placeholder="e.g. Guild of Mages" />
            </div>
            <div className="campaign-form-row">
                <div className="campaign-form-group">
                    <label>Goal</label>
                    <input name="goal" value={form.goal || ''} onChange={handleChange} placeholder="e.g. Find the lost artifact" />
                </div>
                <div className="campaign-form-group">
                    <label>Plan</label>
                    <input name="plan" value={form.plan || ''} onChange={handleChange} placeholder="e.g. Hire mercenaries" />
                </div>
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
