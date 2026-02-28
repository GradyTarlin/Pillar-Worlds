import { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import { ListHeader, EntityCard } from './CampaignShared';
import type { PlotLine } from '../../types/campaign';

export function PlotLinesView() {
    const { data, updateEntities } = useCampaignData();
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleAdd = () => {
        const newPlot: PlotLine = {
            id: `plot_${Date.now()}`,
            name: 'New Plot Line',
            description: '',
            relatedEntities: []
        };
        updateEntities('plotLines', [...data.plotLines, newPlot]);
        setEditingId(newPlot.id);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this plot line?')) {
            updateEntities('plotLines', data.plotLines.filter(p => p.id !== id));
        }
    };

    const handleSave = (updated: PlotLine) => {
        updateEntities('plotLines', data.plotLines.map(p => p.id === updated.id ? updated : p));
        setEditingId(null);
    };

    return (
        <div className="campaign-view-section">
            <ListHeader title="Plot Lines" onAdd={handleAdd} addLabel="Plot Line" />

            <div className="campaign-cards-grid">
                {data.plotLines.map(plot => (
                    editingId === plot.id ? (
                        <PlotLineEditForm
                            key={plot.id}
                            plotLine={plot}
                            onSave={handleSave}
                            onCancel={() => setEditingId(null)}
                        />
                    ) : (
                        <EntityCard
                            key={plot.id}
                            title={plot.name}
                            description={plot.description}
                            tags={[]}
                            onEdit={() => setEditingId(plot.id)}
                            onDelete={() => handleDelete(plot.id)}
                        />
                    )
                ))}
                {data.plotLines.length === 0 && (
                    <p className="campaign-empty-state">No plot lines added yet. Click "+ Plot Line" to start.</p>
                )}
            </div>
        </div>
    );
}

function PlotLineEditForm({
    plotLine,
    onSave,
    onCancel
}: {
    plotLine: PlotLine,
    onSave: (p: PlotLine) => void,
    onCancel: () => void
}) {
    const [form, setForm] = useState<PlotLine>(plotLine);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="campaign-entity-form">
            <h3>Edit Plot Line</h3>
            <div className="campaign-form-group">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} autoFocus />
            </div>
            <div className="campaign-form-group">
                <label>Description (Details/Notes)</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={5} />
            </div>
            <div className="campaign-form-actions">
                <button className="campaign-btn-secondary" onClick={onCancel}>Cancel</button>
                <button className="campaign-btn-primary" onClick={() => onSave(form)}>Save Plot Line</button>
            </div>
        </div>
    );
}
