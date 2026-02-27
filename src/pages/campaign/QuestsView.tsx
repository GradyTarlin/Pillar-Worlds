import { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import { ListHeader, EntityCard } from './CampaignShared';
import type { Quest } from '../../types/campaign';

export function QuestsView() {
    const { data, updateEntities } = useCampaignData();
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleAdd = () => {
        const newQuest: Quest = {
            id: `quest_${Date.now()}`,
            name: 'New Quest',
            description: '',
            status: 'available',
            reward: ''
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

    // Helper to format the status for display
    const formatStatus = (status: string) => {
        return status.replace('_', ' ').toUpperCase();
    };

    return (
        <div className="campaign-view-section">
            <ListHeader title="Quests" onAdd={handleAdd} addLabel="Quest" />

            <div className="campaign-cards-grid">
                {data.quests.map(quest => (
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
                            description={quest.description}
                            tags={[formatStatus(quest.status)]}
                            onEdit={() => setEditingId(quest.id)}
                            onDelete={() => handleDelete(quest.id)}
                            isCompleted={quest.status === 'completed' || quest.status === 'failed'}
                        />
                    )
                ))}
                {data.quests.length === 0 && (
                    <p className="campaign-empty-state">No quests added yet. Click "+ Quest" to start.</p>
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
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                        <option value="available">Available</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
                <div className="campaign-form-group">
                    <label>Reward</label>
                    <input name="reward" value={form.reward} onChange={handleChange} placeholder="e.g. 50g, Magic Sword" />
                </div>
            </div>
            <div className="campaign-form-group">
                <label>Description (Objectives/Details)</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={5} />
            </div>
            <div className="campaign-form-actions">
                <button className="campaign-btn-secondary" onClick={onCancel}>Cancel</button>
                <button className="campaign-btn-primary" onClick={() => onSave(form)}>Save Quest</button>
            </div>
        </div>
    );
}
