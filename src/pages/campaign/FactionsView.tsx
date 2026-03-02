import { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import { ListHeader, EntityCard } from './CampaignShared';
import type { CampaignFaction } from '../../types/campaign';

const factionTypeLabels: Record<string, string> = {
    religious: 'Religious',
    military: 'Military',
    criminal: 'Criminal',
    arcane: 'Arcane',
    spiritual: 'Spiritual',
    guild: 'Guild',
    monster: 'Monster',
};

export function FactionsView() {
    const { data, updateEntities } = useCampaignData();
    const [editingId, setEditingId] = useState<string | null>(null);

    const factions = data.factions || [];

    const handleAdd = () => {
        const newFaction: CampaignFaction = {
            id: `faction_${Date.now()}`,
            name: 'New Faction',
            description: '',
            factionType: 'guild',
        };
        updateEntities('factions', [...factions, newFaction]);
        setEditingId(newFaction.id);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this faction?')) {
            updateEntities('factions', factions.filter(f => f.id !== id));
        }
    };

    const handleSave = (updated: CampaignFaction) => {
        updateEntities('factions', factions.map(f => f.id === updated.id ? updated : f));
        setEditingId(null);
    };

    return (
        <div className="campaign-view-section">
            <ListHeader title="Factions" onAdd={handleAdd} addLabel="Faction" />

            <div className="campaign-cards-grid">
                {factions.map(faction => (
                    editingId === faction.id ? (
                        <FactionEditForm
                            key={faction.id}
                            faction={faction}
                            onSave={handleSave}
                            onCancel={() => setEditingId(null)}
                        />
                    ) : (
                        <EntityCard
                            key={faction.id}
                            title={faction.name}
                            description={faction.description}
                            tags={[faction.factionType ? factionTypeLabels[faction.factionType].toUpperCase() : 'FACTION']}
                            onEdit={() => setEditingId(faction.id)}
                            onDelete={() => handleDelete(faction.id)}
                        >
                            <div style={{ marginTop: '0.5rem' }}>
                                {faction.leader && <div className="campaign-entity-notes" style={{ marginBottom: '0.4rem' }}><strong>Leader:</strong> {faction.leader}</div>}
                                {faction.goal && <div className="campaign-entity-notes"><strong>Goal:</strong> {faction.goal}</div>}
                            </div>
                        </EntityCard>
                    )
                ))}
                {factions.length === 0 && (
                    <p className="campaign-empty-state">No factions added yet.</p>
                )}
            </div>
        </div>
    );
}

function FactionEditForm({
    faction,
    onSave,
    onCancel
}: {
    faction: CampaignFaction,
    onSave: (f: CampaignFaction) => void,
    onCancel: () => void
}) {
    const [form, setForm] = useState<CampaignFaction>(faction);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value as string }));
    };

    return (
        <div className="campaign-entity-form">
            <h3>Edit Faction</h3>
            <div className="campaign-form-group">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} autoFocus />
            </div>
            <div className="campaign-form-group">
                <label>Type</label>
                <select className="app__select" name="factionType" value={form.factionType || 'guild'} onChange={handleChange}>
                    {Object.entries(factionTypeLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>
            <div className="campaign-form-row">
                <div className="campaign-form-group">
                    <label>Leader</label>
                    <input name="leader" value={form.leader || ''} onChange={handleChange} placeholder="e.g. High Priestess" />
                </div>
                <div className="campaign-form-group">
                    <label>Goal</label>
                    <input name="goal" value={form.goal || ''} onChange={handleChange} placeholder="e.g. World domination" />
                </div>
            </div>
            <div className="campaign-form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={5} />
            </div>
            <div className="campaign-form-actions">
                <button className="campaign-btn-secondary" onClick={onCancel}>Cancel</button>
                <button className="campaign-btn-primary" onClick={() => onSave(form)}>Save Faction</button>
            </div>
        </div>
    );
}
