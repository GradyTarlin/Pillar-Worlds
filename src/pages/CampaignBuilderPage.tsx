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
import { UnifiedMap } from './campaign/UnifiedMap';
import { useCampaignData } from '../hooks/useCampaignData';
import './CampaignBuilderPage.css';

export function CampaignBuilderPage() {
    const { data, activeCampaignId, setActiveCampaignId, campaigns } = useCampaignData();
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'regions' | 'characters' | 'factions'>('regions');

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
                    {selectedRegionId ? (
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
                        <div className="campaign-level-1-wrapper" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem', width: '100%', height: 'calc(100vh - 160px)', minHeight: '600px' }}>
                            <div className="campaign-map-viewport" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                <UnifiedMap
                                    context={{ type: 'world' }}
                                    onSelectRegion={handleSelectRegion}
                                />
                            </div>

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
                                        <p style={{ marginBottom: '0.5rem', lineHeight: '1.5' }}>{region.description}</p>
                                    )}
                                </div>

                                <div className="campaign-level-2-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                    <div className="campaign-column">
                                        <SettlementsView regionId={selectedRegionId} onSelectLocation={() => { }} />
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
                            /* LEVEL 3: Dungeon View (Only Dungeons get a map/view now) */
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div className="campaign-location-overview" style={{
                                    background: 'var(--parchment)', padding: '1.5rem', borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--ink)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--burgundy)', margin: '0 0 1rem 0' }}>
                                        {loc.name}
                                    </h2>
                                    {loc.description && (
                                        <p style={{ marginBottom: '1rem', lineHeight: '1.5' }}>{loc.description}</p>
                                    )}
                                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', wordBreak: 'break-word' }}>
                                        {loc.type === 'dungeon' && (
                                            <>
                                                {loc.traps && <div><strong>Traps:</strong> {loc.traps}</div>}
                                                {loc.secrets && <div><strong>Secrets:</strong> {loc.secrets}</div>}
                                                {loc.loot && <div><strong>Loot:</strong> {loc.loot}</div>}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {loc.type === 'dungeon' && (
                                    <div className="campaign-level-2-map" style={{ display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
                                        <UnifiedMap
                                            context={{ type: 'dungeon', id: selectedLocationId }}
                                        />
                                    </div>
                                )}

                                <div className="campaign-level-3-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                    <div className="campaign-column">
                                        <EncountersView locationId={selectedLocationId} />
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </main>
            </div >
        </div >
    );
}
