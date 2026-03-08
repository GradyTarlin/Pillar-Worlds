import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CharactersView } from './campaign/CharactersView';
import { CampaignsView } from './campaign/CampaignsView';
import { QuestsView } from './campaign/QuestsView';
import { RegionsView } from './campaign/RegionsView';
import { SettlementsView } from './campaign/SettlementsView';
import { DungeonsView } from './campaign/DungeonsView';
import { FactionsView } from './campaign/FactionsView';
import { EncountersView } from './campaign/EncountersView';
import { DungeonFeaturesView } from './campaign/DungeonFeaturesView';
import { UnifiedMap } from './campaign/UnifiedMap';
import { useCampaignData } from '../hooks/useCampaignData';
import './CampaignBuilderPage.css';

export function CampaignBuilderPage() {
    const { data, activeCampaignId, setActiveCampaignId, campaigns } = useCampaignData();
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'regions' | 'characters' | 'factions'>('regions');
    const [activeDungeonTab, setActiveDungeonTab] = useState<'encounters' | 'traps' | 'loot' | 'secrets'>('encounters');

    const handleSelectRegion = (id: string | null) => {
        setSelectedRegionId(id);
        setSelectedLocationId(null);
    };

    const handleSelectLocation = (id: string | null) => {
        setSelectedLocationId(id);
    };

    let headerTitle = "Campaign Manager";
    if (selectedRegionId) {
        headerTitle = "Region Explorer";
    } else if (activeCampaignId) {
        const cmp = campaigns.find(c => c.id === activeCampaignId);
        headerTitle = cmp ? cmp.name : "World";
    }

    return (
        <div className="campaign-builder-page">
            <header className="campaign-header" style={{ textAlign: 'center' }}>
                <div className="campaign-header__top" style={{ justifyContent: 'center', position: 'relative' }}>
                    {selectedLocationId ? (
                        <button className="campaign-home-link" style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', left: 0 }} onClick={() => setSelectedLocationId(null)}>← Back to World</button>
                    ) : selectedRegionId ? (
                        <button className="campaign-home-link" style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', left: 0 }} onClick={() => handleSelectRegion(null)}>← Back to World</button>
                    ) : activeCampaignId ? (
                        <button className="campaign-home-link" style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', left: 0 }} onClick={() => setActiveCampaignId(null)}>← Switch Campaign</button>
                    ) : (
                        <Link to="/" className="campaign-home-link" style={{ position: 'absolute', left: 0 }}>← Home</Link>
                    )}
                    <h1>{headerTitle}</h1>
                </div>
                {!selectedLocationId && !selectedRegionId && !activeCampaignId && (
                    <p className="campaign-subtitle" style={{ fontSize: '1.2rem', color: 'var(--ink-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>Create and manage your worlds</p>
                )}
            </header>

            <div className="campaign-layout" style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0, padding: '1rem' }}>
                <main className="campaign-holistic-board" style={{ width: '100%' }}>
                    {!activeCampaignId && (
                        /* LEVEL 0: Campaign Selection */
                        <div className="campaign-column" style={{ maxWidth: '800px', margin: '0 auto', flex: 1 }}>
                            <CampaignsView />
                        </div>
                    )}

                    {activeCampaignId && !selectedRegionId && !selectedLocationId && (
                        /* LEVEL 1: World View */
                        <div className="campaign-level-1-wrapper" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.5rem', width: '100%', height: 'calc(100vh - 160px)', minHeight: '600px' }}>
                            <div className="campaign-side-panel" style={{
                                background: 'var(--parchment)',
                                border: '1px solid var(--ink)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}>
                                <div className="campaign-side-panel__tabs" style={{ display: 'flex', borderBottom: '1px solid var(--ink)' }}>
                                    {(['regions', 'characters', 'factions'] as const).map(tab => (
                                        <button
                                            key={tab}
                                            className={`campaign-side-tab ${activeTab === tab ? 'active' : ''}`}
                                            onClick={() => setActiveTab(tab)}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                border: 'none',
                                                background: activeTab === tab ? 'var(--burgundy)' : 'transparent',
                                                color: activeTab === tab ? 'white' : 'var(--ink)',
                                                cursor: 'pointer',
                                                fontFamily: 'Cinzel, serif',
                                                fontSize: '0.9rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <div className="campaign-side-panel__content" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                                    {activeTab === 'regions' && <RegionsView onSelectRegion={handleSelectRegion} />}
                                    {activeTab === 'characters' && <CharactersView />}
                                    {activeTab === 'factions' && <FactionsView />}
                                </div>
                            </div>

                            <div className="campaign-map-viewport" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                <UnifiedMap
                                    context={{ type: 'world' }}
                                    onSelectRegion={handleSelectRegion}
                                    onSelectLocation={handleSelectLocation}
                                />
                            </div>
                        </div>
                    )}

                    {activeCampaignId && selectedRegionId && !selectedLocationId && (() => {
                        const region = data.regions.find(r => r.id === selectedRegionId);
                        if (!region) return null;

                        return (
                            /* LEVEL 2: Region Explorer */
                            <div className="campaign-level-2-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
                                <div className="campaign-location-overview" style={{
                                    background: 'var(--parchment)', padding: '1.5rem', borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--ink)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--burgundy)', margin: '0 0 1rem 0' }}>
                                        {region.name}
                                    </h2>
                                    {region.description && (
                                        <p className="campaign-description-text">{region.description}</p>
                                    )}
                                </div>

                                <div className="campaign-level-2-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                    <div className="campaign-column">
                                        <SettlementsView regionId={selectedRegionId} />
                                    </div>
                                    <div className="campaign-column">
                                        <DungeonsView regionId={selectedRegionId} onSelectLocation={handleSelectLocation} />
                                    </div>
                                    <div className="campaign-column">
                                        <QuestsView regionId={selectedRegionId} />
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {activeCampaignId && selectedLocationId && (() => {
                        const loc = data.locations.find(l => l.id === selectedLocationId);
                        if (!loc) return null;

                        return (
                            /* LEVEL 3: Dungeon View */
                            <div className="campaign-level-3-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 160px)', minHeight: '600px' }}>
                                <div className="campaign-location-overview" style={{
                                    background: 'var(--parchment)', padding: '1.5rem', borderRadius: 'var(--radius-md)',
                                    border: '3px solid var(--gold-dark)', boxShadow: 'var(--shadow-lg)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--burgundy)', margin: 0 }}>
                                            {loc.name}
                                        </h2>
                                    </div>
                                    {loc.description && (
                                        <p className="campaign-description-text" style={{ margin: 0, lineHeight: '1.6', fontSize: '1.1rem', color: 'var(--ink)' }}>{loc.description}</p>
                                    )}
                                </div>

                                <div className="campaign-internal-layout" style={{ display: 'grid', gridTemplateColumns: '500px 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
                                    <div className="campaign-side-panel" style={{
                                        background: 'var(--parchment)',
                                        border: '3px solid var(--gold-dark)',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        overflow: 'hidden',
                                        boxShadow: 'var(--shadow-md)'
                                    }}>
                                        <div className="campaign-side-panel__tabs" style={{ display: 'flex', borderBottom: '1px solid var(--gold-dark)' }}>
                                            {(['encounters', 'traps', 'loot', 'secrets'] as const).map(tab => (
                                                <button
                                                    key={tab}
                                                    className={`campaign-side-tab ${activeDungeonTab === tab ? 'active' : ''}`}
                                                    onClick={() => setActiveDungeonTab(tab)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.75rem 0.5rem',
                                                        border: 'none',
                                                        background: activeDungeonTab === tab ? 'var(--burgundy)' : 'transparent',
                                                        color: activeDungeonTab === tab ? 'white' : 'var(--ink)',
                                                        cursor: 'pointer',
                                                        fontFamily: 'Cinzel, serif',
                                                        fontSize: '0.8rem',
                                                        transition: 'all 0.2s',
                                                        fontWeight: 700
                                                    }}
                                                >
                                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="campaign-side-panel__content" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                                            {activeDungeonTab === 'encounters' && <EncountersView locationId={selectedLocationId} />}
                                            {activeDungeonTab === 'traps' && <DungeonFeaturesView locationId={selectedLocationId} featureType="trap" />}
                                            {activeDungeonTab === 'loot' && <DungeonFeaturesView locationId={selectedLocationId} featureType="loot" />}
                                            {activeDungeonTab === 'secrets' && <DungeonFeaturesView locationId={selectedLocationId} featureType="secret" />}
                                        </div>
                                    </div>

                                    <div className="campaign-map-viewport" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                        <UnifiedMap
                                            context={{ type: 'dungeon', id: selectedLocationId }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </main>
            </div>
        </div>
    );
}
