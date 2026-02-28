import { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import { ListHeader, EntityCard } from './CampaignShared';
import type { Location } from '../../types/campaign';

// Types are handled purely via title/description if needed

interface DungeonsViewProps {
    regionId: string;
    onSelectLocation: (id: string) => void;
}

export function DungeonsView({ regionId, onSelectLocation }: DungeonsViewProps) {
    const { data, updateEntities } = useCampaignData();
    const [editingId, setEditingId] = useState<string | null>(null);

    const regionalDungeons = data.locations.filter(l => l.type === 'dungeon' && l.regionId === regionId);

    const handleAdd = () => {
        const newLoc: Location = {
            id: `loc_${Date.now()}`,
            name: 'New Dungeon',
            description: '',
            type: 'dungeon',
            regionId
        };
        updateEntities('locations', [...data.locations, newLoc]);
        setEditingId(newLoc.id);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this dungeon?')) {
            updateEntities('locations', data.locations.filter(l => l.id !== id));
        }
    };

    const handleSave = (updated: Location) => {
        updateEntities('locations', data.locations.map(l => l.id === updated.id ? updated : l));
        setEditingId(null);
    };

    return (
        <div className="campaign-view-section">
            <ListHeader title="Dungeons" onAdd={handleAdd} addLabel="Dungeon" />

            <div className="campaign-cards-grid">
                {regionalDungeons.map(loc => (
                    editingId === loc.id ? (
                        <DungeonEditForm
                            key={loc.id}
                            location={loc}
                            onSave={handleSave}
                            onCancel={() => setEditingId(null)}
                        />
                    ) : (
                        <EntityCard
                            key={loc.id}
                            title={loc.name}
                            description={loc.description}
                            tags={['DUNGEON']}
                            onEdit={() => setEditingId(loc.id)}
                            onDelete={() => handleDelete(loc.id)}
                        >
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--ink)' }}>
                                <button className="campaign-btn-primary" style={{ width: '100%' }} onClick={() => onSelectLocation(loc.id)}>
                                    View Dungeon
                                </button>
                            </div>
                        </EntityCard>
                    )
                ))}
                {regionalDungeons.length === 0 && (
                    <p className="campaign-empty-state">No dungeons added here yet. Click "+ Dungeon" to start.</p>
                )}
            </div>
        </div>
    );
}

function DungeonEditForm({
    location,
    onSave,
    onCancel
}: {
    location: Location,
    onSave: (l: Location) => void,
    onCancel: () => void
}) {
    const [form, setForm] = useState<Location>(location);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="campaign-entity-form">
            <h3>Edit Dungeon</h3>
            <div className="campaign-form-group">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} autoFocus />
            </div>
            <div className="campaign-form-group">
                <label>Description (Lore/Hazards)</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={5} />
            </div>
            <div className="campaign-form-actions">
                <button className="campaign-btn-secondary" onClick={onCancel}>Cancel</button>
                <button className="campaign-btn-primary" onClick={() => onSave(form)}>Save Dungeon</button>
            </div>
        </div>
    );
}
