import { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import { ListHeader, EntityCard } from './CampaignShared';
import type { Quest } from '../../types/campaign';

interface QuestsViewProps {
    regionId?: string;
}

export function QuestsView({ regionId }: QuestsViewProps) {
    const { data, updateEntities } = useCampaignData();
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleAdd = () => {
        const newQuest: Quest = {
            id: `quest_${Date.now()}`,
            name: 'New Quest',
            description: '',
            reward: '',
            objective: '',
            regionId
        };
        updateEntities('quests', [...data.quests, newQuest]);
        setEditingId(newQuest.id);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this quest?')) {
            updateEntities('quests', data.quests.filter(q => q.id !== id));
        }
    };

    const handleSave = (updated: Quest) => {
        updateEntities('quests', data.quests.map(q => q.id === updated.id ? updated : q));
        setEditingId(null);
    };

    const filteredQuests = regionId
        ? data.quests.filter(q => q.regionId === regionId)
        : data.quests;

    return (
        <div className="campaign-view-section">
            <ListHeader title="Quests" onAdd={handleAdd} addLabel="Quest" />

            <div className="campaign-cards-grid">
                {filteredQuests.map(quest => (
                    editingId === quest.id ? (
                        <QuestEditForm
                            key={quest.id}
                            quest={quest}
                            onSave={handleSave}
                            onCancel={() => setEditingId(null)}
                        />
                    ) : (
                        <EntityCard
                            key={quest.id}
                            title={quest.name}
                            subtitle={quest.reward ? `Reward: ${quest.reward}` : undefined}
                            description={quest.objective ? `Objective: ${quest.objective}` : undefined}
                            tags={[]}
                            onEdit={() => setEditingId(quest.id)}
                            onDelete={() => handleDelete(quest.id)}
                        >
                            {quest.clientId && <p className="campaign-entity-notes"><strong>Client:</strong> {quest.clientId}</p>}
                            {quest.description && <p className="campaign-entity-notes" style={{ marginTop: '0.5rem' }}><strong>Notes:</strong> {quest.description}</p>}
                        </EntityCard>
                    )
                ))}
                {filteredQuests.length === 0 && (
                    <p className="campaign-empty-state">No quests added here yet. Click "+ Quest" to start.</p>
                )}
            </div>
        </div>
    );
}

function QuestEditForm({
    quest,
    onSave,
    onCancel
}: {
    quest: Quest,
    onSave: (q: Quest) => void,
    onCancel: () => void
}) {
    const [form, setForm] = useState<Quest>(quest);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="campaign-entity-form">
            <h3>Edit Quest</h3>
            <div className="campaign-form-group">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} autoFocus />
            </div>
            <div className="campaign-form-row">
                <div className="campaign-form-group">
                    <label>Client / Giver</label>
                    <input name="clientId" value={form.clientId || ''} onChange={handleChange} placeholder="e.g. Mayor, Innkeeper" />
                </div>
            </div>
            <div className="campaign-form-group">
                <label>Objective</label>
                <input name="objective" value={form.objective || ''} onChange={handleChange} placeholder="e.g. Slay the Goblin King" />
            </div>
            <div className="campaign-form-group">
                <label>Reward</label>
                <input name="reward" value={form.reward} onChange={handleChange} placeholder="e.g. 50g, Magic Sword" />
            </div>
            <div className="campaign-form-group">
                <label>Description & Notes</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={5} />
            </div>
            <div className="campaign-form-actions">
                <button className="campaign-btn-secondary" onClick={onCancel}>Cancel</button>
                <button className="campaign-btn-primary" onClick={() => onSave(form)}>Save Quest</button>
            </div>
        </div>
    );
}
