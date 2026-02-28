import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './DataManagementPage.css';

const CHARACTERS_KEY = 'pillar_worlds_characters';
const CAMPAIGNS_KEY = 'pillar_worlds_campaigns';

export function DataManagementPage() {
    const [statusMsg, setStatusMsg] = useState('');
    const [success, setSuccess] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showMessage = (msg: string, isSuccess: boolean) => {
        setStatusMsg(msg);
        setSuccess(isSuccess);
        setTimeout(() => setStatusMsg(''), 5000);
    };

    const handleExport = () => {
        try {
            const charData = localStorage.getItem(CHARACTERS_KEY);
            const campData = localStorage.getItem(CAMPAIGNS_KEY);

            const exportObj = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                characters: charData ? JSON.parse(charData) : [],
                campaigns: campData ? JSON.parse(campData) : []
            };

            const dataStr = JSON.stringify(exportObj, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `pillar-worlds-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showMessage('Data exported successfully!', true);
        } catch (e) {
            console.error(e);
            showMessage('Failed to export data.', false);
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const parsed = JSON.parse(content);

                // Basic validation
                if (!parsed.characters && !parsed.campaigns) {
                    throw new Error('Invalid backup file structure.');
                }

                // Merge logic. For characters, we merge by ID.
                if (parsed.characters && Array.isArray(parsed.characters)) {
                    const existingCharsStr = localStorage.getItem(CHARACTERS_KEY);
                    const existingChars = existingCharsStr ? JSON.parse(existingCharsStr) : [];
                    const mergedChars = [...existingChars];

                    for (const importedChar of parsed.characters) {
                        const existingIndex = mergedChars.findIndex((c: { id: string }) => c.id === importedChar.id);
                        if (existingIndex >= 0) {
                            // Update existing
                            mergedChars[existingIndex] = importedChar;
                        } else {
                            // Add new
                            mergedChars.push(importedChar);
                        }
                    }
                    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(mergedChars));
                }

                // Merge logic for campaigns.
                if (parsed.campaigns && Array.isArray(parsed.campaigns)) {
                    const existingCampsStr = localStorage.getItem(CAMPAIGNS_KEY);
                    const existingCamps = existingCampsStr ? JSON.parse(existingCampsStr) : [];
                    const mergedCamps = [...existingCamps];

                    for (const importedCamp of parsed.campaigns) {
                        const existingIndex = mergedCamps.findIndex((c: { id: string }) => c.id === importedCamp.id);
                        if (existingIndex >= 0) {
                            // Update existing
                            mergedCamps[existingIndex] = importedCamp;
                        } else {
                            // Add new
                            mergedCamps.push(importedCamp);
                        }
                    }
                    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(mergedCamps));
                }

                showMessage('Data imported successfully!', true);
            } catch (err: unknown) {
                console.error(err);
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                showMessage(`Failed to import data: ${errorMessage}`, false);
            }

            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const triggerImport = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="data-page">
            <header className="data-page__header">
                <div className="data-page__header-top">
                    <Link to="/" className="data-page__home-link">← Home</Link>
                    <h1>Data Management</h1>
                </div>
                <p className="data-page__subtitle">Backup and Restore your Characters & Campaigns</p>
            </header>

            <main className="data-page__main">
                <div className="data-panel">
                    <h3>Export Data</h3>
                    <p>
                        Download a backup file containing all of your characters and campaigns.
                        Keep this file safe to restore your data later or share it with other devices.
                    </p>
                    <button className="data-btn primary" onClick={handleExport}>
                        Download Backup .JSON
                    </button>
                </div>

                <div className="data-panel">
                    <h3>Import Data</h3>
                    <p>
                        Restore your characters and campaigns from a previously exported backup file.
                        This will merge the imported data with your existing data, overwriting any matching IDs.
                    </p>
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleImport}
                        style={{ display: 'none' }}
                    />
                    <button className="data-btn secondary" onClick={triggerImport}>
                        Upload Backup .JSON
                    </button>
                </div>

                {statusMsg && (
                    <div className={`data-status ${success ? 'success' : 'error'}`}>
                        {statusMsg}
                    </div>
                )}
            </main>
        </div>
    );
}
