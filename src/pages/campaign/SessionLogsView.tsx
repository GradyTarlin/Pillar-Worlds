import { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import { ListHeader, EntityCard } from './CampaignShared';
import type { SessionLog } from '../../types/campaign';
import './SessionLogsView.css';

export function SessionLogsView() {
    const { data, updateEntities } = useCampaignData();
    const [isAdding, setIsAdding] = useState(false);
    const [newLogContent, setNewLogContent] = useState('');
    const [newLogDate, setNewLogDate] = useState(new Date().toISOString().split('T')[0]);

    const logs = data.sessionLogs || [];

    const handleAddLog = () => {
        if (!newLogContent.trim()) return;

        const newLog: SessionLog = {
            id: `log_${Date.now()}`,
            name: `Session on ${newLogDate}`,
            description: '',
            date: newLogDate,
            content: newLogContent,
        };

        const updatedLogs = [...logs, newLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        updateEntities('sessionLogs', updatedLogs);

        setNewLogContent('');
        setIsAdding(false);
    };

    const handleDeleteLog = (id: string) => {
        updateEntities('sessionLogs', logs.filter(l => l.id !== id));
    };

    return (
        <div className="campaign-view-section session-logs-view">
            <ListHeader title="Session Logs" onAdd={() => setIsAdding(!isAdding)} addLabel="Log" />

            {isAdding && (
                <div className="campaign-entity-form">
                    <h3>New Session Log</h3>
                    <div className="campaign-form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            value={newLogDate}
                            onChange={(e) => setNewLogDate(e.target.value)}
                        />
                    </div>
                    <div className="campaign-form-group">
                        <label>Session Notes</label>
                        <textarea
                            value={newLogContent}
                            onChange={(e) => setNewLogContent(e.target.value)}
                            placeholder="What happened this session?"
                            rows={4}
                        />
                    </div>
                    <div className="campaign-form-actions">
                        <button className="campaign-btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
                        <button className="campaign-btn-primary" onClick={handleAddLog}>Save Log</button>
                    </div>
                </div>
            )}

            <div className="campaign-cards-grid">
                {logs.length === 0 ? (
                    <p className="campaign-empty-state">No session logs yet.</p>
                ) : (
                    logs.map(log => (
                        <EntityCard
                            key={log.id}
                            title={log.name}
                            onEdit={() => { }}
                            onDelete={() => handleDeleteLog(log.id)}
                            editIcon="📅"
                        >
                            <div className="session-log-content" style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                {log.content}
                            </div>
                        </EntityCard>
                    ))
                )}
            </div>
        </div>
    );
}
