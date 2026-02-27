import { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import { ListHeader, EntityCard } from './CampaignShared';
import type { Location, LocationType } from '../../types/campaign';

const locationTypeLabels: Record<LocationType, string> = {
    village: 'Village',
    town: 'Town',
    city: 'City',
    dungeon: 'Dungeon',
    landmark: 'Landmark'
};

export function LocationsView() {
    const { data, updateEntities } = useCampaignData();
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleAdd = () => {
        const newLoc: Location = {
            id: `loc_${Date.now()}`,
            name: 'New Location',
            description: '',
            type: 'village',
            regionId: '',
            population: 0
        };
        updateEntities('locations', [...data.locations, newLoc]);
        setEditingId(newLoc.id);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this location?')) {
            updateEntities('locations', data.locations.filter(l => l.id !== id));
        }
    };

    const handleSave = (updated: Location) => {
        updateEntities('locations', data.locations.map(l => l.id === updated.id ? updated : l));
        setEditingId(null);
    };

    return (
        <div className="campaign-view-section">
            <ListHeader title="Locations & Dungeons" onAdd={handleAdd} addLabel="Location" />

            <div className="campaign-cards-grid">
                {data.locations.map(loc => (
                    editingId === loc.id ? (
                        <LocationEditForm
                            key={loc.id}
                            location={loc}
                            onSave={handleSave}
                            onCancel={() => setEditingId(null)}
                            regions={data.regions}
                        />
                    ) : (
                        <EntityCard
                            key={loc.id}
                            title={loc.name}
                            subtitle={loc.regionId ? `Region: ${data.regions.find(r => r.id === loc.regionId)?.name || 'Unknown'}` : undefined}
                            description={loc.description}
                            tags={[
                                locationTypeLabels[loc.type].toUpperCase(),
                                loc.population ? `Pop: ${loc.population}` : ''
                            ].filter(Boolean)}
                            onEdit={() => setEditingId(loc.id)}
                            onDelete={() => handleDelete(loc.id)}
                        />
                    )
                ))}
                {data.locations.length === 0 && (
                    <p className="campaign-empty-state">No locations added yet. Click "+ Location" to start.</p>
                )}
            </div>
        </div>
    );
}

function LocationEditForm({
    location,
    onSave,
    onCancel,
    regions
}: {
    location: Location,
    onSave: (l: Location) => void,
    onCancel: () => void,
    regions: { id: string, name: string }[]
}) {
    const [form, setForm] = useState<Location>(location);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'population' ? parseInt(value) || 0 : value
        }));
    };

    return (
        <div className="campaign-entity-form">
            <h3>Edit Location</h3>
            <div className="campaign-form-group">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} autoFocus />
            </div>
            <div className="campaign-form-row">
                <div className="campaign-form-group">
                    <label>Type</label>
                    <select name="type" value={form.type} onChange={handleChange}>
                        {Object.entries(locationTypeLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
                <div className="campaign-form-group">
                    <label>Region</label>
                    <select name="regionId" value={form.regionId || ''} onChange={handleChange}>
                        <option value="">-- None --</option>
                        {regions.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            {(form.type === 'village' || form.type === 'town' || form.type === 'city') && (
                <div className="campaign-form-group">
                    <label>Population</label>
                    <input type="number" name="population" value={form.population || 0} onChange={handleChange} min="0" />
                </div>
            )}
            <div className="campaign-form-group">
                <label>Description (Lore/Sights/Features)</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={5} />
            </div>
            <div className="campaign-form-actions">
                <button className="campaign-btn-secondary" onClick={onCancel}>Cancel</button>
                <button className="campaign-btn-primary" onClick={() => onSave(form)}>Save Location</button>
            </div>
        </div>
    );
}
