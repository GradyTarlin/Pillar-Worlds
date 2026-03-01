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
import { InteractiveMap } from './campaign/InteractiveMap';
import { CampaignSidebar } from './campaign/CampaignSidebar';
import { useCampaignData } from '../hooks/useCampaignData';
import './CampaignBuilderPage.css';

export function CampaignBuilderPage() {
    const { data, activeCampaignId, setActiveCampaignId } = useCampaignData();
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

    const handleSelectRegion = (id: string | null) => {
        setSelectedRegionId(id);
        setSelectedLocationId(null);
    };

    const handleSelectLocation = (id: string | null) => {
        setSelectedLocationId(id);
    };

    let headerTitle = "Campaign Manager";
    if (selectedLocationId) {
        const loc = (data.locations || []).find(l => l.id === selectedLocationId);
        if (loc) headerTitle = loc.type === 'settlement' ? 'Settlement' : 'Dungeon';
    } else if (selectedRegionId) {
        headerTitle = "Region";
    } else if (activeCampaignId) {
        headerTitle = "World";
    }

    return (
        <div className="campaign-builder-page">
            <header className="campaign-header" style={{ textAlign: 'center' }}>
                <div className="campaign-header__top" style={{ justifyContent: 'center', position: 'relative' }}>
                    {selectedLocationId ? (
                        <button className="campaign-home-link" style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', left: 0 }} onClick={() => handleSelectLocation(null)}>← Back to Region</button>
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

            <div className="campaign-layout" style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
                {activeCampaignId && (
                    <CampaignSidebar
                        selectedRegionId={selectedRegionId}
                        selectedLocationId={selectedLocationId}
                        onSelectRegion={handleSelectRegion}
                        onSelectLocation={handleSelectLocation}
                    />
                )}
                <main className="campaign-holistic-board">
                    {!activeCampaignId && (
                        /* LEVEL 0: Campaign Selection */
                        <div className="campaign-column" style={{ maxWidth: '800px', margin: '0 auto', flex: 1 }}>
                            <CampaignsView />
                        </div>
                    )}

                    {activeCampaignId && !selectedRegionId && !selectedLocationId && (
                        /* LEVEL 1: World View */
                        <div className="campaign-level-1-wrapper" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', width: '100%' }}>
                            <div className="campaign-row" style={{ flex: '2 1 600px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                                <InteractiveMap onSelectLocation={handleSelectLocation} />
                            </div>
                            <div className="campaign-level-1-grid" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignSelf: 'flex-start' }}>
                                <div className="campaign-column" style={{ marginBottom: 0, flex: '0 0 auto' }}>
                                    <RegionsView onSelectRegion={handleSelectRegion} />
                                </div>
                                <div className="campaign-column" style={{ marginBottom: 0, flex: '0 0 auto' }}>
                                    <FactionsView />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeCampaignId && selectedRegionId && !selectedLocationId && (() => {
                        const region = data.regions.find(r => r.id === selectedRegionId);
                        if (!region) return null;

                        return (
                            /* LEVEL 2: Region View */
                            <div className="campaign-level-2-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
                                <div className="campaign-location-overview" style={{
                                    background: 'var(--parchment)', padding: '1.5rem', borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--ink)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--burgundy)', margin: '0 0 1rem 0' }}>
                                        {region.name}
                                    </h2>
                                    {region.description && (
                                        <p style={{ marginBottom: '0', lineHeight: '1.5' }}>{region.description}</p>
                                    )}
                                </div>

                                <div className="campaign-level-2-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                                    <div className="campaign-column">
                                        <SettlementsView regionId={selectedRegionId} onSelectLocation={handleSelectLocation} />
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
                            /* LEVEL 3: Local View */
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
                                        {loc.type === 'settlement' && (
                                            <>
                                                {loc.leader && <div><strong>Leader:</strong> {loc.leader}</div>}
                                                {loc.economy && <div style={{ textTransform: 'capitalize' }}><strong>Economy:</strong> {loc.economy}</div>}
                                            </>
                                        )}
                                        {loc.type === 'dungeon' && (
                                            <>
                                                {loc.traps && <div><strong>Traps:</strong> {loc.traps}</div>}
                                                {loc.secrets && <div><strong>Secrets:</strong> {loc.secrets}</div>}
                                                {loc.loot && <div><strong>Loot:</strong> {loc.loot}</div>}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="campaign-level-3-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                                    {loc.type === 'settlement' && (
                                        <div className="campaign-column">
                                            <CharactersView locationId={selectedLocationId} />
                                        </div>
                                    )}
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
