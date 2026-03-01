import { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import { ListHeader, EntityCard } from './CampaignShared';
import type { Region } from '../../types/campaign';

interface RegionsViewProps {
    onSelectRegion: (id: string) => void;
}

export function RegionsView({ onSelectRegion }: RegionsViewProps) {
    const { data, updateEntities } = useCampaignData();
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleAdd = () => {
        const newRegion: Region = {
            id: `region_${Date.now()}`,
            name: 'New Region',
            description: '',
            climate: 'Temperate',
        };
        updateEntities('regions', [...data.regions, newRegion]);
        setEditingId(newRegion.id);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this region? Locations inside it will lose their region reference.')) {
            updateEntities('regions', data.regions.filter(r => r.id !== id));

            // Cleanup location references
            const updatedLocations = data.locations.map(loc => {
                if (loc.regionId === id) {
                    const newLoc = { ...loc };
                    delete newLoc.regionId;
                    return newLoc;
                }
                return loc;
            });
            updateEntities('locations', updatedLocations);
        }
    };

    const handleSave = (updated: Region) => {
        updateEntities('regions', data.regions.map(r => r.id === updated.id ? updated : r));
        setEditingId(null);
    };

    return (
        <div className="campaign-view-section">
            <ListHeader title="Regions" onAdd={handleAdd} addLabel="Region" />

            <div className="campaign-cards-grid">
                {data.regions.map(region => (
                    editingId === region.id ? (
                        <RegionEditForm
                            key={region.id}
                            region={region}
                            onSave={handleSave}
                            onCancel={() => setEditingId(null)}
                        />
                    ) : (
                        <EntityCard
                            key={region.id}
                            title={region.name}
                            subtitle={`${region.climate} Climate`}
                            description={region.description}
                            onEdit={() => setEditingId(region.id)}
                            onDelete={() => handleDelete(region.id)}
                        >
                            <div style={{ marginTop: '1rem' }}>
                                <button className="campaign-btn-primary" style={{ width: '100%' }} onClick={() => onSelectRegion(region.id)}>
                                    View Region
                                </button>
                            </div>
                        </EntityCard>
                    )
                ))}
                {data.regions.length === 0 && (
                    <p className="campaign-empty-state">No regions added yet. Click "+ Region" to start.</p>
                )}
            </div>
        </div>
    );
}

function RegionEditForm({
    region,
    onSave,
    onCancel
}: {
    region: Region,
    onSave: (r: Region) => void,
    onCancel: () => void
}) {
    const [form, setForm] = useState<Region>(region);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="campaign-entity-form">
            <h3>Edit Region</h3>
            <div className="campaign-form-group">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} autoFocus />
            </div>
            <div className="campaign-form-group">
                <label>Climate / Biome</label>
                <input name="climate" value={form.climate} onChange={handleChange} placeholder="e.g. Temperate Forest, Arid Desert" />
            </div>
            <div className="campaign-form-group">
                <label>Description (Lore/Details)</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={5} />
            </div>
            <div className="campaign-form-actions">
                <button className="campaign-btn-secondary" onClick={onCancel}>Cancel</button>
                <button className="campaign-btn-primary" onClick={() => onSave(form)}>Save Region</button>
            </div>
        </div>
    );
}
