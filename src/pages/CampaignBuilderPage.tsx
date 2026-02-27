import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CharactersView } from './campaign/CharactersView';
import { PlotLinesView } from './campaign/PlotLinesView';
import { QuestsView } from './campaign/QuestsView';
import { RegionsView } from './campaign/RegionsView';
import { LocationsView } from './campaign/LocationsView';
import './CampaignBuilderPage.css';

type CampaignTab = 'characters' | 'monsters' | 'plots' | 'quests' | 'regions' | 'locations';

export function CampaignBuilderPage() {
    const [activeTab, setActiveTab] = useState<CampaignTab>('characters');

    const tabs: { id: CampaignTab, label: string }[] = [
        { id: 'characters', label: 'Characters & NPCs' },
        { id: 'monsters', label: 'Monsters' },
        { id: 'plots', label: 'Plot Lines' },
        { id: 'quests', label: 'Quests' },
        { id: 'regions', label: 'Regions & Provinces' },
        { id: 'locations', label: 'Locations & Dungeons' }
    ];

    return (
        <div className="campaign-builder-page">
            <header className="campaign-header">
                <div className="campaign-header__top">
                    <Link to="/" className="campaign-home-link">← Home</Link>
                    <h1>Campaign Builder</h1>
                </div>
            </header>

            <div className="campaign-layout">
                <aside className="campaign-sidebar">
                    <nav className="campaign-nav">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`campaign-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="campaign-content">
                    {activeTab === 'characters' && <CharactersView />}
                    {activeTab === 'monsters' && (
                        <div className="campaign-placeholder">
                            <h2>Monsters Integration</h2>
                            <p>For now, please use the <Link to="/monsters" style={{ color: 'var(--burgundy)', textDecoration: 'underline' }}>Monster Archive</Link> to view all available monsters for your campaign.</p>
                            <p>Custom campaign-specific monster creation will be added in a future update.</p>
                        </div>
                    )}
                    {activeTab === 'plots' && <PlotLinesView />}
                    {activeTab === 'quests' && <QuestsView />}
                    {activeTab === 'regions' && <RegionsView />}
                    {activeTab === 'locations' && <LocationsView />}
                </main>
            </div>
        </div>
    );
}
