import { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import { ListHeader, EntityCard } from './CampaignShared';
import type { DungeonFeature } from '../../types/campaign';

interface DungeonFeaturesViewProps {
    locationId: string;
    featureType: 'trap' | 'secret' | 'loot';
}

export function DungeonFeaturesView({ locationId, featureType }: DungeonFeaturesViewProps) {
    const { data, updateEntities } = useCampaignData();
    const [editingId, setEditingId] = useState<string | null>(null);

    const features = (data.dungeonFeatures || []).filter(f => f.locationId === locationId && f.type === featureType);

    const title = featureType.charAt(0).toUpperCase() + featureType.slice(1) + 's';

    const handleAdd = () => {
        const newFeature: DungeonFeature = {
            id: `${featureType}_${Date.now()}`,
            name: `New ${featureType.charAt(0).toUpperCase() + featureType.slice(1)}`,
            description: '',
            type: featureType,
            locationId
        };
        updateEntities('dungeonFeatures', [...(data.dungeonFeatures || []), newFeature]);
        setEditingId(newFeature.id);
    };

    const handleDelete = (id: string) => {
        if (confirm(`Are you sure you want to delete this ${featureType}?`)) {
            updateEntities('dungeonFeatures', (data.dungeonFeatures || []).filter(f => f.id !== id));
        }
    };

    const handleSave = (updated: DungeonFeature) => {
        updateEntities('dungeonFeatures', (data.dungeonFeatures || []).map(f => f.id === updated.id ? updated : f));
        setEditingId(null);
    };

    return (
        <div className="campaign-view-section">
            <ListHeader title={title} onAdd={handleAdd} addLabel={title.slice(0, -1)} />

            <div className="campaign-cards-grid">
                {features.map(feat => {
                    return editingId === feat.id ? (
                        <FeatureEditForm
                            key={feat.id}
                            feature={feat}
                            onSave={handleSave}
                            onCancel={() => setEditingId(null)}
                        />
                    ) : (
                        <EntityCard
                            key={feat.id}
                            title={feat.name}
                            description={feat.description}
                            tags={[]}
                            onEdit={() => setEditingId(feat.id)}
                            onDelete={() => handleDelete(feat.id)}
                        />
                    );
                })}
                {features.length === 0 && (
                    <p className="campaign-empty-state">No {title.toLowerCase()} added yet. Click "+ {title.slice(0, -1)}" to start.</p>
                )}
            </div>
        </div>
    );
}

function FeatureEditForm({
    feature,
    onSave,
    onCancel
}: {
    feature: DungeonFeature,
    onSave: (f: DungeonFeature) => void,
    onCancel: () => void
}) {
    const [form, setForm] = useState<DungeonFeature>(feature);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="campaign-entity-form">
            <h3>Edit {feature.type.charAt(0).toUpperCase() + feature.type.slice(1)}</h3>
            <div className="campaign-form-group">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} autoFocus />
            </div>
            <div className="campaign-form-group">
                <label>Description</label>
                <textarea name="description" value={form.description || ''} onChange={handleChange} rows={5} />
            </div>
            <div className="campaign-form-actions">
                <button className="campaign-btn-secondary" onClick={onCancel}>Cancel</button>
                <button className="campaign-btn-primary" onClick={() => onSave(form)}>Save</button>
            </div>
        </div>
    );
}
