import { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import { ListHeader, EntityCard } from './CampaignShared';

export function CampaignsView() {
    const { campaigns, setActiveCampaignId, createCampaign, deleteCampaign } = useCampaignData();
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = () => {
        setIsCreating(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this entire campaign and all of its contents?')) {
            deleteCampaign(id);
        }
    };

    return (
        <div className="campaign-view-section">
            <ListHeader title="Your Campaigns" onAdd={handleCreate} addLabel="Campaign" />

            {isCreating && (
                <CreateCampaignForm
                    onSave={(name, desc) => {
                        createCampaign(name, desc);
                        setIsCreating(false);
                    }}
                    onCancel={() => setIsCreating(false)}
                />
            )}

            <div className="campaign-cards-grid">
                {campaigns.map(camp => (
                    <EntityCard
                        key={camp.id}
                        title={camp.name}
                        tags={['CAMPAIGN']}
                        onEdit={() => setActiveCampaignId(camp.id)} // "Edit" in this context enters the campaign
                        onDelete={() => handleDelete(camp.id)}
                        editIcon="→"
                    >
                        <p>{camp.description}</p>
                        <button
                            className="campaign-btn-primary"
                            style={{ marginTop: '1rem', width: '100%' }}
                            onClick={() => setActiveCampaignId(camp.id)}
                        >
                            Enter Campaign
                        </button>
                    </EntityCard>
                ))}
                {campaigns.length === 0 && !isCreating && (
                    <p className="campaign-empty-state">You haven't created any campaigns yet. Click "+ Campaign" to get started.</p>
                )}
            </div>
        </div>
    );
}

function CreateCampaignForm({ onSave, onCancel }: { onSave: (name: string, desc: string) => void, onCancel: () => void }) {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');

    return (
        <div className="campaign-entity-form" style={{ marginBottom: '2rem' }}>
            <h3>Create New Campaign</h3>
            <div className="campaign-form-group">
                <label>Campaign Name</label>
                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. The Shattered Isles"
                    autoFocus
                />
            </div>
            <div className="campaign-form-group">
                <label>Description (Optional)</label>
                <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    rows={3}
                    placeholder="A brief overview of the setting or premise..."
                />
            </div>
            <div className="campaign-form-actions">
                <button className="campaign-btn-secondary" onClick={onCancel}>Cancel</button>
                <button
                    className="campaign-btn-primary"
                    disabled={!name.trim()}
                    onClick={() => onSave(name, desc)}
                >
                    Create
                </button>
            </div>
        </div>
    );
}
