import { useState } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import './CampaignSidebar.css';

interface CampaignSidebarProps {
    viewMode: 'world' | 'network' | 'characters';
    selectedRegionId: string | null;
    selectedLocationId: string | null;
    onSelectRegion: (id: string | null) => void;
    onSelectLocation: (id: string | null) => void;
    onSelectViewMode: (mode: 'world' | 'network' | 'characters') => void;
}

export function CampaignSidebar({
    viewMode,
    selectedRegionId,
    selectedLocationId,
    onSelectRegion,
    onSelectLocation,
    onSelectViewMode
}: CampaignSidebarProps) {
    const { data } = useCampaignData();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        'root': true,
        'regions': true,
        'global': true
    });

    const toggle = (id: string, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const isExp = (id: string) => !!expanded[id];

    // Build the tree nodes
    const regions = data.regions || [];
    const locations = data.locations || [];
    const characters = data.characters || [];
    const quests = data.quests || [];
    const encounters = data.encounters || [];

    const handleSelectHome = () => {
        onSelectRegion(null);
        onSelectLocation(null);
        onSelectViewMode('world');
    };

    const handleSelectRegion = (id: string) => {
        onSelectRegion(id);
        onSelectLocation(null);
        onSelectViewMode('world');
    };

    const handleSelectLocation = (id: string, regionId?: string) => {
        if (regionId && selectedRegionId !== regionId) {
            onSelectRegion(regionId);
        }
        onSelectLocation(id);
        onSelectViewMode('world');
    };

    return (
        <aside className="campaign-sidebar">
            <h2 className="sidebar-title">Content Browser</h2>
            <div className="sidebar-tree">

                <div className="tree-folder" style={{ marginBottom: '0.5rem' }}>
                    <div className={`tree-node ${viewMode === 'network' ? 'active' : ''}`} onClick={() => onSelectViewMode('network')}>
                        <span className="tree-expander" style={{ visibility: 'hidden' }}>▶</span>
                        <span className="tree-icon">🕸️</span>
                        <span className="tree-label">Social Network</span>
                    </div>
                </div>

                <div className="tree-folder" style={{ marginBottom: '0.5rem' }}>
                    <div className={`tree-node ${viewMode === 'characters' ? 'active' : ''}`} onClick={() => onSelectViewMode('characters')}>
                        <span className="tree-expander" style={{ visibility: 'hidden' }}>▶</span>
                        <span className="tree-icon">👥</span>
                        <span className="tree-label">Characters</span>
                    </div>
                </div>



                {/* WORLD VIEW / REGIONS */}
                <div className="tree-folder">
                    <div className={`tree-node ${viewMode === 'world' && !selectedRegionId && !selectedLocationId ? 'active' : ''}`} onClick={handleSelectHome}>
                        <span className="tree-expander" onClick={(e) => toggle('regions', e)}>{isExp('regions') ? '▼' : '▶'}</span>
                        <span className="tree-icon">🌍</span>
                        <span className="tree-label">World View ({regions.length} Regions)</span>
                    </div>

                    {isExp('regions') && (
                        <div className="tree-children">
                            {regions.map(region => {
                                const regionLocs = locations.filter(l => l.regionId === region.id);
                                const regionQuests = quests.filter(q => q.regionId === region.id);
                                const isRegionActive = selectedRegionId === region.id && !selectedLocationId;

                                return (
                                    <div className="tree-folder" key={region.id}>
                                        <div className={`tree-node ${isRegionActive ? 'active' : ''}`} onClick={() => handleSelectRegion(region.id)}>
                                            <span className="tree-expander" onClick={(e) => toggle(`reg_${region.id}`, e)}>
                                                {isExp(`reg_${region.id}`) ? '▼' : '▶'}
                                            </span>
                                            <span className="tree-icon">🏔️</span>
                                            <span className="tree-label">{region.name}</span>
                                        </div>

                                        {isExp(`reg_${region.id}`) && (
                                            <div className="tree-children">
                                                {regionLocs.map(loc => {
                                                    const isLocActive = selectedLocationId === loc.id;
                                                    const locChars = characters.filter(c => c.locationId === loc.id);
                                                    const locEncounters = encounters.filter(e => e.locationId === loc.id);
                                                    const hasItems = locChars.length > 0 || locEncounters.length > 0;

                                                    return (
                                                        <div className="tree-folder" key={loc.id}>
                                                            <div className={`tree-node ${isLocActive ? 'active' : ''}`} onClick={() => handleSelectLocation(loc.id, region.id)}>
                                                                <span className="tree-expander" onClick={(e) => toggle(`loc_${loc.id}`, e)}>
                                                                    {hasItems ? (isExp(`loc_${loc.id}`) ? '▼' : '▶') : <span style={{ width: '12px', display: 'inline-block' }}></span>}
                                                                </span>
                                                                <span className="tree-icon">{loc.type === 'settlement' ? '🏘️' : '⚔️'}</span>
                                                                <span className="tree-label">{loc.name}</span>
                                                            </div>

                                                            {isExp(`loc_${loc.id}`) && (
                                                                <div className="tree-children">
                                                                    {locChars.map(c => (
                                                                        <div className="tree-folder" key={c.id}>
                                                                            <div className="tree-node" onClick={() => handleSelectLocation(loc.id, region.id)}>
                                                                                <span style={{ width: '12px', display: 'inline-block', margin: '0 4px' }}></span>
                                                                                <span className="tree-icon">🧑‍🤝‍🧑</span>
                                                                                <span className="tree-label">{c.name}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}

                                                                    {locEncounters.map(e => (
                                                                        <div className="tree-folder" key={e.id}>
                                                                            <div className="tree-node" onClick={() => handleSelectLocation(loc.id, region.id)}>
                                                                                <span style={{ width: '12px', display: 'inline-block', margin: '0 4px' }}></span>
                                                                                <span className="tree-icon">🎲</span>
                                                                                <span className="tree-label">{e.name}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                                {regionLocs.length === 0 && <div className="tree-empty">No locations</div>}
                                                {regionQuests.map(q => (
                                                    <div className="tree-folder" key={q.id}>
                                                        <div className="tree-node" onClick={() => handleSelectRegion(region.id)}>
                                                            <span style={{ width: '12px', display: 'inline-block', margin: '0 4px' }}></span>
                                                            <span className="tree-icon">📜</span>
                                                            <span className="tree-label">{q.name}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>



            </div>
        </aside>
    );
}
