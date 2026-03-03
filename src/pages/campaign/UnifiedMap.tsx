import { useState, useRef, useCallback } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import type { MapBiome, MapFeature, MapTile, MapPoiType, CustomMap, Region } from '../../types/campaign';
import './MapMaker.css';

type ToolMode = 'biome' | 'water' | 'poi' | 'erase';

export interface UnifiedMapContext {
    type: 'world' | 'region' | 'dungeon';
    id?: string;
}

interface UnifiedMapProps {
    context: UnifiedMapContext;
    onSelectLocation?: (id: string) => void;
    onSelectRegion?: (id: string) => void;
}

export function UnifiedMap({ context, onSelectLocation, onSelectRegion }: UnifiedMapProps) {
    const { data, updateEntities } = useCampaignData();
    const [activeTool, setActiveTool] = useState<ToolMode>('biome');
    const [selectedBiome, setSelectedBiome] = useState<MapBiome>('grassland');
    const [selectedFeature, setSelectedFeature] = useState<MapFeature>('river');
    const [selectedPoiType, setSelectedPoiType] = useState<MapPoiType>('town');
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [history, setHistory] = useState<Record<string, MapTile>[]>([]);

    const [isPromptOpen, setIsPromptOpen] = useState(false);
    const [promptLabel, setPromptLabel] = useState('');
    const [pendingTile, setPendingTile] = useState<{ x: number, y: number } | null>(null);

    const [isRegionPromptOpen, setIsRegionPromptOpen] = useState(false);
    const [pendingRegionTiles, setPendingRegionTiles] = useState<string[]>([]);
    const [selectedRegionIdForAssign, setSelectedRegionIdForAssign] = useState<string>('');
    const [newRegionName, setNewRegionName] = useState('');

    const canvasRef = useRef<HTMLDivElement>(null);

    // Dynamic sizing based on context
    const getInitialMapSize = () => {
        if (context.type === 'world') return { width: 60, height: 45 };
        if (context.type === 'region') return { width: 40, height: 30 };
        if (context.type === 'dungeon') return { width: 30, height: 30 };
        return { width: 40, height: 30 };
    };

    const getMapReference = (): CustomMap => {
        if (context.type === 'world') {
            return data.customMap || { ...getInitialMapSize(), grid: {}, isFinalized: false };
        } else if (context.type === 'region' && context.id) {
            const region = data.regions.find(r => r.id === context.id);
            return region?.customMap || { ...getInitialMapSize(), grid: {}, isFinalized: false };
        } else if (context.type === 'dungeon' && context.id) {
            const loc = data.locations.find(l => l.id === context.id);
            return loc?.customMap || { ...getInitialMapSize(), grid: {}, isFinalized: false };
        }
        return { ...getInitialMapSize(), grid: {}, isFinalized: false };
    };

    const saveMapReference = (newMap: CustomMap) => {
        if (context.type === 'world') {
            updateEntities('customMap', newMap);
        } else if (context.type === 'region' && context.id) {
            updateEntities('regions', data.regions.map(r => r.id === context.id ? { ...r, customMap: newMap } : r));
        } else if (context.type === 'dungeon' && context.id) {
            updateEntities('locations', data.locations.map(l => l.id === context.id ? { ...l, customMap: newMap } : l));
        }
    };

    const currentMap = getMapReference();
    const isFinalized = !!currentMap.isFinalized;

    const saveHistory = useCallback(() => {
        setHistory(prev => [...prev, { ...currentMap.grid }]);
    }, [currentMap.grid]);

    const undo = () => {
        if (history.length === 0) return;
        const previousGrid = history[history.length - 1];
        const newHistory = history.slice(0, -1);

        saveMapReference({ ...currentMap, grid: previousGrid });
        setHistory(newHistory);
    };

    const getContiguousLandmass = (startX: number, startY: number): string[] => {
        const grid = currentMap.grid;
        const visited = new Set<string>();
        const queue = [`${startX},${startY}`];
        const landmass = [];

        while (queue.length > 0) {
            const current = queue.shift()!;
            if (visited.has(current)) continue;

            visited.add(current);
            const tile = grid[current];

            // Only count non-ocean tiles that haven't been assigned to a region yet
            if (tile && tile.biome !== 'ocean') {
                landmass.push(current);

                const [cx, cy] = current.split(',').map(Number);
                const neighbors = [
                    `${cx},${cy - 1}`, `${cx},${cy + 1}`,
                    `${cx - 1},${cy}`, `${cx + 1},${cy}`
                ];

                for (const n of neighbors) {
                    if (!visited.has(n)) {
                        queue.push(n);
                    }
                }
            }
        }
        return landmass;
    };

    const handleTileInteraction = useCallback((x: number, y: number, isInitialClick: boolean = false) => {
        const key = `${x},${y}`;
        const newGrid = { ...currentMap.grid };
        const currentTile = newGrid[key] || { biome: 'ocean', feature: 'none' };

        if (isFinalized) {
            if (!isInitialClick) return; // Ignore drag interactions when finalized

            if (currentTile.poiId && onSelectLocation) {
                // If resolving actual locations based on POI later, mapping logic goes here
                // We simulate routing by ID for demonstration
                onSelectLocation(currentTile.poiId);
                return;
            } else if (currentTile.regionId && onSelectRegion) {
                onSelectRegion(currentTile.regionId);
                return;
            } else if (currentTile.biome !== 'ocean' && context.type === 'world') {
                const landmassTarget = getContiguousLandmass(x, y);
                if (landmassTarget.length > 0) {
                    setPendingRegionTiles(landmassTarget);
                    setSelectedRegionIdForAssign('');
                    setNewRegionName('');
                    setIsRegionPromptOpen(true);
                }
            }
            return;
        }

        if (activeTool === 'biome') {
            newGrid[key] = { ...currentTile, biome: selectedBiome };
        } else if (activeTool === 'water') {
            newGrid[key] = { ...currentTile, feature: selectedFeature };
        } else if (activeTool === 'poi') {
            if (!isInitialClick) return;
            setPendingTile({ x, y });
            setPromptLabel('');
            setIsPromptOpen(true);
            return;
        } else if (activeTool === 'erase') {
            if (currentTile.poiId) {
                const updatedTile = { ...currentTile };
                delete updatedTile.poiId;
                delete updatedTile.poiType;
                delete updatedTile.label;
                newGrid[key] = updatedTile;
            } else {
                newGrid[key] = { biome: 'ocean', feature: 'none' };
            }
        }

        saveMapReference({ ...currentMap, grid: newGrid });
    }, [currentMap, activeTool, selectedBiome, selectedFeature, isFinalized, saveMapReference]);

    const handleSavePoi = () => {
        if (!pendingTile || !promptLabel.trim()) return;

        const key = `${pendingTile.x},${pendingTile.y}`;
        const newGrid = { ...currentMap.grid };
        const currentTile = newGrid[key] || { biome: 'ocean', feature: 'none' };

        saveHistory();

        let targetId = `poi_${Date.now()}`;
        // If we are placing a dungeon/settlement, we might auto-create the location entity here
        // For now, we store it simply as a POI link reference

        newGrid[key] = { ...currentTile, poiId: targetId, poiType: selectedPoiType, label: promptLabel.trim() };

        saveMapReference({ ...currentMap, grid: newGrid });
        setIsPromptOpen(false);
        setPendingTile(null);
    };

    const handleAssignRegion = () => {
        if (!selectedRegionIdForAssign && !newRegionName.trim()) return;

        let finalRegionId = selectedRegionIdForAssign;

        if (!finalRegionId && newRegionName.trim()) {
            finalRegionId = `region_${Date.now()}`;
            const newRegion: Region = {
                id: finalRegionId,
                name: newRegionName.trim(),
                description: '',
                climate: 'Temperate',
            };
            updateEntities('regions', [...data.regions, newRegion]);
        }

        const newGrid = { ...currentMap.grid };
        pendingRegionTiles.forEach(key => {
            if (newGrid[key]) {
                newGrid[key] = { ...newGrid[key], regionId: finalRegionId };
            }
        });

        saveMapReference({ ...currentMap, grid: newGrid });
        setIsRegionPromptOpen(false);
        setPendingRegionTiles([]);
    };

    const getPoiIcon = (type?: MapPoiType) => {
        switch (type) {
            case 'town': return '🏘️';
            case 'village': return '🏕️';
            case 'city': return '🏰';
            case 'dungeon': return '⚔️';
            case 'quest': return '📜';
            default: return '📍';
        }
    };

    const renderGrid = () => {
        const tiles = [];

        for (let y = 0; y < currentMap.height; y++) {
            for (let x = 0; x < currentMap.width; x++) {
                const key = `${x},${y}`;
                const tile = currentMap.grid[key] || { biome: 'ocean', feature: 'none' };

                let tileClasses = `map-tile tile-${tile.biome} ${tile.feature !== 'none' ? `feature-${tile.feature}` : ''}`;
                if (isFinalized && tile.biome !== 'ocean') {
                    tileClasses += ' interactive';
                    if (tile.regionId) {
                        tileClasses += ' defined-region';
                    }
                }

                tiles.push(
                    <div
                        key={key}
                        className={tileClasses}
                        onMouseDown={() => {
                            if (!isFinalized && activeTool !== 'poi') saveHistory();
                            setIsMouseDown(true);
                            handleTileInteraction(x, y, true);
                        }}
                        onMouseEnter={() => { if (isMouseDown && !isFinalized) handleTileInteraction(x, y, false); }}
                        onMouseUp={() => setIsMouseDown(false)}
                        title={isFinalized && tile.regionId ? data.regions.find(r => r.id === tile.regionId)?.name : ''}
                    >
                        {tile.poiId && (
                            <div className={`poi-marker ${isFinalized ? 'clickable' : ''}`} title={tile.label}>
                                {getPoiIcon(tile.poiType)}
                                <span className="poi-label">{tile.label}</span>
                            </div>
                        )}
                        {/* Region color tinting over landmass */}
                        {isFinalized && tile.regionId && (
                            <div className="region-tint" style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(255, 215, 0, 0.15)', pointerEvents: 'none'
                            }}></div>
                        )}
                    </div>
                );
            }
        }
        return tiles;
    };

    return (
        <div
            className={`unified-map-container ${isFinalized ? 'view-mode' : 'edit-mode'}`}
            onMouseLeave={() => setIsMouseDown(false)}
            onMouseUp={() => setIsMouseDown(false)}
        >
            <div className="map-toolbar-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', background: 'var(--parchment)', borderBottom: '1px solid var(--gold)' }}>
                <h3 style={{ margin: 0, fontFamily: 'Cinzel, serif', color: 'var(--burgundy)' }}>
                    {context.type === 'world' ? 'World Map' : context.type === 'region' ? 'Region Map' : 'Dungeon Layout'}
                </h3>
                <button
                    className="campaign-btn campaign-btn-primary"
                    onClick={() => saveMapReference({ ...currentMap, isFinalized: !isFinalized })}
                >
                    {isFinalized ? '✏️ Edit Map' : '✅ Finalize Map'}
                </button>
            </div>

            {isPromptOpen && (
                <div className="map-maker-modal-overlay">
                    <div className="map-maker-modal">
                        <h3>Name This Location</h3>
                        <p>Assign a name to this {selectedPoiType}.</p>
                        <input
                            type="text"
                            value={promptLabel}
                            onChange={(e) => setPromptLabel(e.target.value)}
                            placeholder="Location name..."
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSavePoi();
                                if (e.key === 'Escape') {
                                    setIsPromptOpen(false);
                                    setPendingTile(null);
                                }
                            }}
                        />
                        <div className="modal-actions">
                            <button className="campaign-btn campaign-btn-primary" onClick={handleSavePoi}>Save Location</button>
                            <button className="campaign-btn campaign-btn-secondary" onClick={() => { setIsPromptOpen(false); setPendingTile(null); }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {isRegionPromptOpen && (
                <div className="map-maker-modal-overlay">
                    <div className="map-maker-modal">
                        <h3>Define Region</h3>
                        <p>You selected a contiguous landmass. Assign it to a region:</p>
                        <select
                            className="app__select"
                            value={selectedRegionIdForAssign}
                            onChange={(e) => {
                                setSelectedRegionIdForAssign(e.target.value);
                                if (e.target.value) setNewRegionName(''); // Clear new input if selecting existing
                            }}
                        >
                            <option value="">-- Select Existing Region --</option>
                            {data.regions.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                        <div style={{ textAlign: 'center', margin: '0.5rem 0', fontWeight: 'bold' }}>OR</div>
                        <input
                            type="text"
                            value={newRegionName}
                            onChange={(e) => {
                                setNewRegionName(e.target.value);
                                if (e.target.value) setSelectedRegionIdForAssign(''); // Clear select if making new
                            }}
                            placeholder="Create New Region Name..."
                        />
                        <div className="modal-actions">
                            <button className="campaign-btn campaign-btn-primary" onClick={handleAssignRegion} disabled={!selectedRegionIdForAssign && !newRegionName.trim()}>Assign Region</button>
                            <button className="campaign-btn campaign-btn-secondary" onClick={() => { setIsRegionPromptOpen(false); setPendingRegionTiles([]); }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {!isFinalized && (
                <div className="map-maker-toolbar" style={{ borderTop: 'none', borderRight: 'none', borderLeft: 'none', borderRadius: 0 }}>
                    <div className="tool-group">
                        <button
                            className={`tool-btn ${activeTool === 'biome' ? 'active' : ''}`}
                            onClick={() => setActiveTool('biome')}
                        >🌳 Biomes</button>
                        <button
                            className={`tool-btn ${activeTool === 'water' ? 'active' : ''}`}
                            onClick={() => setActiveTool('water')}
                        >💧 Water</button>
                        <button
                            className={`tool-btn ${activeTool === 'poi' ? 'active' : ''}`}
                            onClick={() => setActiveTool('poi')}
                        >📍 POI</button>
                        <button
                            className={`tool-btn ${activeTool === 'erase' ? 'active' : ''}`}
                            onClick={() => setActiveTool('erase')}
                        >🧹 Erase</button>
                    </div>

                    {activeTool === 'biome' && (
                        <div className="tool-group">
                            {(['ocean', 'plain', 'grassland', 'forest', 'jungle', 'mountain', 'desert', 'wetland', 'taiga'] as MapBiome[]).map(b => (
                                <button
                                    key={b}
                                    className={`tool-btn ${selectedBiome === b ? 'active' : ''}`}
                                    onClick={() => setSelectedBiome(b)}
                                    style={{ textTransform: 'capitalize' }}
                                >{b}</button>
                            ))}
                        </div>
                    )}

                    {activeTool === 'water' && (
                        <div className="tool-group">
                            {(['river', 'lake'] as MapFeature[]).map(f => (
                                <button
                                    key={f}
                                    className={`tool-btn ${selectedFeature === f ? 'active' : ''}`}
                                    onClick={() => setSelectedFeature(f)}
                                    style={{ textTransform: 'capitalize' }}
                                >{f}</button>
                            ))}
                        </div>
                    )}

                    {activeTool === 'poi' && (
                        <div className="tool-group">
                            {(['village', 'town', 'city', 'dungeon', 'quest'] as MapPoiType[]).map(t => (
                                <button
                                    key={t}
                                    className={`tool-btn ${selectedPoiType === t ? 'active' : ''}`}
                                    onClick={() => setSelectedPoiType(t)}
                                    style={{ textTransform: 'capitalize' }}
                                >
                                    {getPoiIcon(t)} {t}
                                </button>
                            ))}
                        </div>
                    )}

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="tool-btn"
                            onClick={undo}
                            disabled={history.length === 0}
                            style={{ opacity: history.length === 0 ? 0.5 : 1 }}
                        >↩️ Undo</button>
                    </div>
                </div>
            )}

            <div className="map-grid-viewport" ref={canvasRef} style={{ borderRadius: isFinalized ? '0 0 8px 8px' : '0', borderTop: 'none' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px', zIndex: 100 }}>
                    <button className="control-btn" onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}>➕</button>
                    <button className="control-btn" onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}>➖</button>
                </div>
                <div
                    className="map-grid"
                    style={{
                        gridTemplateColumns: `repeat(${currentMap.width}, 32px)`,
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top left',
                        width: 'fit-content',
                        paddingBottom: '30px',
                        paddingRight: '30px'
                    }}
                >
                    {renderGrid()}
                </div>
            </div>
        </div>
    );
}
