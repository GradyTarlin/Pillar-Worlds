import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CharactersView } from './campaign/CharactersView';
import { CampaignsView } from './campaign/CampaignsView';
import { QuestsView } from './campaign/QuestsView';
import { RegionsView } from './campaign/RegionsView';

import { DungeonsView } from './campaign/DungeonsView';
import { FactionsView } from './campaign/FactionsView';
import { EncountersView } from './campaign/EncountersView';
import { UnifiedMap } from './campaign/UnifiedMap';
import { CampaignSidebar } from './campaign/CampaignSidebar';
import { SocialNetworkView } from './campaign/SocialNetworkView';
import { useCampaignData } from '../hooks/useCampaignData';
import './CampaignBuilderPage.css';

export function CampaignBuilderPage() {
    const { data, activeCampaignId, setActiveCampaignId, campaigns } = useCampaignData();
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'world' | 'network' | 'characters'>('world');

    const handleSelectRegion = (id: string | null) => {
        setSelectedRegionId(id);
        setSelectedLocationId(null);
        setViewMode('world');
    };

    const handleSelectLocation = (id: string | null) => {
        setSelectedLocationId(id);
        setViewMode('world');
    };

    const handleSelectViewMode = (mode: 'world' | 'network' | 'characters') => {
        setViewMode(mode);
        if (mode !== 'world') {
            setSelectedRegionId(null);
            setSelectedLocationId(null);
        }
    };

    let headerTitle = "Campaign Manager";
    if (viewMode === 'network') {
        headerTitle = "Character Network";
    } else if (viewMode === 'characters') {
        headerTitle = "Characters";
    } else if (selectedRegionId) {
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
                        <button className="campaign-home-link" style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', left: 0 }} onClick={() => { setActiveCampaignId(null); handleSelectViewMode('world'); }}>← Switch Campaign</button>
                    ) : (
                        <Link to="/" className="campaign-home-link" style={{ position: 'absolute', left: 0 }}>← Home</Link>
                    )}
                    <h1>{headerTitle}</h1>
                </div>
                {!selectedLocationId && !selectedRegionId && !activeCampaignId && (
                    <p className="campaign-subtitle" style={{ fontSize: '1.2rem', color: 'var(--ink-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>Create and manage your worlds</p>
                )}
            </header>

            <div className="campaign-layout" style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
                {activeCampaignId && (
                    <CampaignSidebar
                        viewMode={viewMode}
                        selectedRegionId={selectedRegionId}
                        selectedLocationId={selectedLocationId}
                        onSelectRegion={handleSelectRegion}
                        onSelectLocation={handleSelectLocation}
                        onSelectViewMode={handleSelectViewMode}
                    />
                )}
                <main className="campaign-holistic-board">
                    {!activeCampaignId && (
                        /* LEVEL 0: Campaign Selection */
                        <div className="campaign-column" style={{ maxWidth: '800px', margin: '0 auto', flex: 1 }}>
                            <CampaignsView />
                        </div>
                    )}

                    {activeCampaignId && viewMode === 'network' && (
                        /* LEVEL 1: Character Network */
                        <div className="campaign-level-1-wrapper" style={{ display: 'flex', width: '100%', minHeight: '600px' }}>
                            <SocialNetworkView
                                onSelectRegion={handleSelectRegion}
                                onSelectLocation={handleSelectLocation}
                            />
                        </div>
                    )}

                    {activeCampaignId && viewMode === 'characters' && (
                        /* LEVEL 1: Characters List */
                        <div className="campaign-level-1-wrapper" style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '600px' }}>
                            <CharactersView />
                        </div>
                    )}

                    {activeCampaignId && viewMode === 'world' && !selectedRegionId && !selectedLocationId && (
                        /* LEVEL 1: World View */
                        <div className="campaign-level-1-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                            <div className="campaign-row" style={{ width: '100%', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
                                <UnifiedMap
                                    context={{ type: 'world' }}
                                    onSelectRegion={handleSelectRegion}
                                />
                            </div>
                            <div className="campaign-level-1-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', width: '100%' }}>
                                <div className="campaign-column" style={{ marginBottom: 0 }}>
                                    <RegionsView onSelectRegion={handleSelectRegion} />
                                </div>
                                <div className="campaign-column" style={{ marginBottom: 0 }}>
                                    <FactionsView />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeCampaignId && viewMode === 'world' && selectedRegionId && !selectedLocationId && (() => {
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

                                <div className="campaign-level-2-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
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

                    {activeCampaignId && viewMode === 'world' && selectedLocationId && (() => {
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

                                <div className="campaign-level-3-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                                    {loc.type === 'dungeon' && (
                                        <div className="campaign-column">
                                            <EncountersView locationId={selectedLocationId} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </main>
            </div >
        </div >
    );
}
