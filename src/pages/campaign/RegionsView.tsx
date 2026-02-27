import { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import { ListHeader, EntityCard } from './CampaignShared';
import type { Region } from '../../types/campaign';

export function RegionsView() {
    const { data, updateEntities } = useCampaignData();
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleAdd = () => {
        const newRegion: Region = {
            id: `region_${Date.now()}`,
            name: 'New Region',
            description: '',
            climate: 'Temperate',
            dangerLevel: 1
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
                    const { regionId, ...rest } = loc; // Remove reference
                    return rest;
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
            <ListHeader title="Regions & Provinces" onAdd={handleAdd} addLabel="Region" />

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
                            tags={[`Danger Level: ${region.dangerLevel}`]}
                            onEdit={() => setEditingId(region.id)}
                            onDelete={() => handleDelete(region.id)}
                        />
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
        setForm(prev => ({ ...prev, [name]: name === 'dangerLevel' ? parseInt(value) || 1 : value }));
    };

    return (
        <div className="campaign-entity-form">
            <h3>Edit Region</h3>
            <div className="campaign-form-group">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} autoFocus />
            </div>
            <div className="campaign-form-row">
                <div className="campaign-form-group">
                    <label>Climate / Biome</label>
                    <input name="climate" value={form.climate} onChange={handleChange} placeholder="e.g. Temperate Forest, Arid Desert" />
                </div>
                <div className="campaign-form-group">
                    <label>Danger Level (1-10)</label>
                    <input type="number" name="dangerLevel" value={form.dangerLevel} onChange={handleChange} min="1" max="10" />
                </div>
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
