import { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import { ListHeader, EntityCard } from './CampaignShared';
import type { Location } from '../../types/campaign';

const settlementTypeLabels: Record<string, string> = {
    camp: 'Camp',
    village: 'Village',
    town: 'Town',
    city: 'City'
};

interface SettlementsViewProps {
    regionId: string;
    onSelectLocation: (id: string) => void;
}

export function SettlementsView({ regionId, onSelectLocation }: SettlementsViewProps) {
    const { data, updateEntities } = useCampaignData();
    const [editingId, setEditingId] = useState<string | null>(null);

    const regionalSettlements = data.locations.filter(l => l.type === 'settlement' && l.regionId === regionId);

    const handleAdd = () => {
        const newLoc: Location = {
            id: `loc_${Date.now()}`,
            name: 'New Settlement',
            description: '',
            type: 'settlement',
            settlementType: 'village',
            regionId
        };
        updateEntities('locations', [...data.locations, newLoc]);
        setEditingId(newLoc.id);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this settlement?')) {
            updateEntities('locations', data.locations.filter(l => l.id !== id));
        }
    };

    const handleSave = (updated: Location) => {
        updateEntities('locations', data.locations.map(l => l.id === updated.id ? updated : l));
        setEditingId(null);
    };

    return (
        <div className="campaign-view-section">
            <ListHeader title="Settlements" onAdd={handleAdd} addLabel="Settlement" />

            <div className="campaign-cards-grid">
                {regionalSettlements.map(loc => (
                    editingId === loc.id ? (
                        <SettlementEditForm
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
                            tags={[
                                loc.settlementType ? settlementTypeLabels[loc.settlementType].toUpperCase() : 'SETTLEMENT'
                            ].filter(Boolean)}
                            onEdit={() => setEditingId(loc.id)}
                            onDelete={() => handleDelete(loc.id)}
                        >
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--ink)' }}>
                                <button className="campaign-btn-primary" style={{ width: '100%' }} onClick={() => onSelectLocation(loc.id)}>
                                    View Settlement
                                </button>
                            </div>
                        </EntityCard>
                    )
                ))}
                {regionalSettlements.length === 0 && (
                    <p className="campaign-empty-state">No settlements added here yet. Click "+ Settlement" to start.</p>
                )}
            </div>
        </div>
    );
}

function SettlementEditForm({
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
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="campaign-entity-form">
            <h3>Edit Settlement</h3>
            <div className="campaign-form-group">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} autoFocus />
            </div>
            <div className="campaign-form-row">
                <div className="campaign-form-group">
                    <label>Type</label>
                    <select name="settlementType" value={form.settlementType || 'village'} onChange={handleChange}>
                        {Object.entries(settlementTypeLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="campaign-form-group">
                <label>Description (Lore/Sights/Features)</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={5} />
            </div>
            <div className="campaign-form-actions">
                <button className="campaign-btn-secondary" onClick={onCancel}>Cancel</button>
                <button className="campaign-btn-primary" onClick={() => onSave(form)}>Save Settlement</button>
            </div>
        </div>
    );
}
