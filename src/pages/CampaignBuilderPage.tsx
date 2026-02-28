import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CharactersView } from './campaign/CharactersView';
import { PlotLinesView } from './campaign/PlotLinesView';
import { CampaignsView } from './campaign/CampaignsView';
import { QuestsView } from './campaign/QuestsView';
import { RegionsView } from './campaign/RegionsView';
import { SettlementsView } from './campaign/SettlementsView';
import { DungeonsView } from './campaign/DungeonsView';
import { MonstersView } from './campaign/MonstersView';
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

    return (
        <div className="campaign-builder-page">
            <header className="campaign-header">
                <div className="campaign-header__top">
                    {selectedLocationId ? (
                        <button className="campaign-home-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleSelectLocation(null)}>← Back to Region</button>
                    ) : selectedRegionId ? (
                        <button className="campaign-home-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleSelectRegion(null)}>← Back to World</button>
                    ) : activeCampaignId ? (
                        <button className="campaign-home-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setActiveCampaignId(null)}>← Switch Campaign</button>
                    ) : (
                        <Link to="/" className="campaign-home-link">← Home</Link>
                    )}
                    <h1>Campaign Manager</h1>
                </div>
            </header>

            <div className="campaign-layout">
                <main className="campaign-holistic-board">
                    {!activeCampaignId && (
                        /* LEVEL 0: Campaign Selection */
                        <div className="campaign-column" style={{ maxWidth: '800px', margin: '0 auto', flex: 1 }}>
                            <CampaignsView />
                        </div>
                    )}

                    {activeCampaignId && !selectedRegionId && !selectedLocationId && (
                        /* LEVEL 1: World View */
                        <>
                            <div className="campaign-column">
                                <PlotLinesView />
                            </div>
                            <div className="campaign-column">
                                <RegionsView onSelectRegion={handleSelectRegion} />
                            </div>
                        </>
                    )}

                    {activeCampaignId && selectedRegionId && !selectedLocationId && (
                        /* LEVEL 2: Region View */
                        <>
                            <div className="campaign-column">
                                <SettlementsView regionId={selectedRegionId} onSelectLocation={handleSelectLocation} />
                            </div>
                            <div className="campaign-column">
                                <DungeonsView regionId={selectedRegionId} onSelectLocation={handleSelectLocation} />
                            </div>
                        </>
                    )}

                    {activeCampaignId && selectedLocationId && (() => {
                        const loc = data.locations.find(l => l.id === selectedLocationId);
                        if (!loc) return null;

                        return (
                            /* LEVEL 3: Local View */
                            <>
                                {loc.type === 'settlement' && (
                                    <>
                                        <div className="campaign-column">
                                            <CharactersView locationId={selectedLocationId} />
                                        </div>
                                        <div className="campaign-column">
                                            <QuestsView locationId={selectedLocationId} />
                                        </div>
                                    </>
                                )}
                                {loc.type === 'dungeon' && (
                                    <div className="campaign-column">
                                        <MonstersView locationId={selectedLocationId} />
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </main>
            </div>
        </div>
    );
}
