import { useState, useRef, useCallback } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import type { MapTerrain, MapTile, MapPoiType, CustomMap, Region } from '../../types/campaign';
import './MapMaker.css';

type ToolMode = 'terrain' | 'bucket' | 'poi' | 'erase';

export interface UnifiedMapContext {
    type: 'world' | 'dungeon';
    id?: string;
}

interface UnifiedMapProps {
    context: UnifiedMapContext;
    onSelectLocation?: (id: string) => void;
    onSelectRegion?: (id: string) => void;
}

export function UnifiedMap({ context, onSelectLocation, onSelectRegion }: UnifiedMapProps) {
    const { data, updateEntities } = useCampaignData();
    const [activeTool, setActiveTool] = useState<ToolMode>('terrain');
    const [selectedTerrain, setSelectedTerrain] = useState<MapTerrain>(context.type === 'dungeon' ? 'stone' : 'grassland');
    const [selectedPoiType, setSelectedPoiType] = useState<MapPoiType>(context.type === 'dungeon' ? 'encounter' : 'town');
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [history, setHistory] = useState<Record<string, MapTile>[]>([]);

    const [isLocationPromptOpen, setIsLocationPromptOpen] = useState(false);
    const [pendingPoiTile, setPendingPoiTile] = useState<{ x: number, y: number, poiType: MapPoiType } | null>(null);
    const [promptLabel, setPromptLabel] = useState('');
    const [promptDescription, setPromptDescription] = useState('');
    const [selectedRegionIdForLocation, setSelectedRegionIdForLocation] = useState<string>('');

    const [isRegionPromptOpen, setIsRegionPromptOpen] = useState(false);
    const [pendingRegionTiles, setPendingRegionTiles] = useState<string[]>([]);
    const [selectedRegionIdForAssign, setSelectedRegionIdForAssign] = useState<string>('');
    const [newRegionName, setNewRegionName] = useState('');

    const canvasRef = useRef<HTMLDivElement>(null);

    // Dynamic sizing based on context
    const getInitialMapSize = () => {
        if (context.type === 'world') return { width: 60, height: 45 };
        if (context.type === 'dungeon') return { width: 30, height: 30 };
        return { width: 40, height: 30 };
    };

    const getMapReference = (): CustomMap => {
        if (context.type === 'world') {
            return data.customMap || { ...getInitialMapSize(), grid: {}, isFinalized: false };
        } else if (context.type === 'dungeon' && context.id) {
            const loc = data.locations.find(l => l.id === context.id);
            return loc?.customMap || { ...getInitialMapSize(), grid: {}, isFinalized: false };
        }
        return { ...getInitialMapSize(), grid: {}, isFinalized: false };
    };

    const saveMapReference = (newMap: CustomMap) => {
        if (context.type === 'world') {
            updateEntities('customMap', newMap);
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
            const tile = grid[current] || { terrain: 'ocean' };

            // Only count non-ocean tiles that haven't been assigned to a region yet
            if (tile.terrain !== 'ocean') {
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

    const getContiguousSameTerrain = (startX: number, startY: number, targetTerrain: MapTerrain, newGrid: Record<string, MapTile>): string[] => {
        const visited = new Set<string>();
        const queue = [`${startX},${startY}`];
        const area = [];

        while (queue.length > 0) {
            const current = queue.shift()!;
            if (visited.has(current)) continue;

            visited.add(current);
            const tile = newGrid[current] || { terrain: 'ocean' };

            if (tile.terrain === targetTerrain) {
                area.push(current);

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
        return area;
    };

    const handleTileInteraction = useCallback((x: number, y: number, isInitialClick: boolean = false) => {
        const key = `${x},${y}`;
        const newGrid = { ...currentMap.grid };
        const currentTile = newGrid[key] || { terrain: 'ocean' };

        if (isFinalized) {
            if (!isInitialClick) return; // Ignore drag interactions when finalized

            if (currentTile.poiType && !currentTile.poiId) {
                // Clicked an Undefined POI
                setPendingPoiTile({ x, y, poiType: currentTile.poiType });
                setPromptLabel('');
                setPromptDescription('');
                setSelectedRegionIdForLocation('');
                setIsLocationPromptOpen(true);
                return;
            } else if (currentTile.poiId && onSelectLocation) {
                onSelectLocation(currentTile.poiId);
                return;
            } else if (currentTile.regionId && onSelectRegion) {
                onSelectRegion(currentTile.regionId);
                return;
            } else if (currentTile.terrain !== 'ocean' && context.type === 'world') {
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

        if (activeTool === 'terrain') {
            newGrid[key] = { ...currentTile, terrain: selectedTerrain };
        } else if (activeTool === 'bucket') {
            if (!isInitialClick) return;
            const targetTerrain = currentTile.terrain;
            if (targetTerrain === selectedTerrain) return;

            const areaToFill = getContiguousSameTerrain(x, y, targetTerrain, newGrid);
            areaToFill.forEach(k => {
                newGrid[k] = { ...newGrid[k], terrain: selectedTerrain };
            });
        } else if (activeTool === 'poi') {
            if (!isInitialClick) return;
            newGrid[key] = { ...currentTile, poiType: selectedPoiType };
        } else if (activeTool === 'erase') {
            if (currentTile.poiType || currentTile.poiId) {
                const updatedTile = { ...currentTile };
                delete updatedTile.poiId;
                delete updatedTile.poiType;
                delete updatedTile.label;
                delete updatedTile.description;
                newGrid[key] = updatedTile;
            } else {
                newGrid[key] = { terrain: 'ocean' };
            }
        }

        saveMapReference({ ...currentMap, grid: newGrid });
    }, [currentMap, activeTool, selectedTerrain, selectedPoiType, isFinalized, saveMapReference, context.type, onSelectLocation, onSelectRegion]);

    const handleSavePoi = () => {
        if (!pendingPoiTile || !promptLabel.trim()) return;

        const key = `${pendingPoiTile.x},${pendingPoiTile.y}`;
        const newGrid = { ...currentMap.grid };
        const currentTile = newGrid[key] || { terrain: 'ocean' };

        saveHistory();

        let targetId = `poi_${Date.now()}`;

        newGrid[key] = {
            ...currentTile,
            poiId: targetId,
            poiType: pendingPoiTile.poiType,
            label: promptLabel.trim(),
            description: promptDescription.trim(),
            regionId: selectedRegionIdForLocation || currentTile.regionId
        };

        saveMapReference({ ...currentMap, grid: newGrid });
        setIsLocationPromptOpen(false);
        setPendingPoiTile(null);
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
            case 'loot': return '💰';
            case 'trap': return '⚠️';
            case 'secret': return '👁️';
            case 'encounter': return '👹';
            default: return '📍';
        }
    };

    const renderGrid = () => {
        const tiles = [];

        for (let y = 0; y < currentMap.height; y++) {
            for (let x = 0; x < currentMap.width; x++) {
                const key = `${x},${y}`;
                const tile = currentMap.grid[key] || { terrain: 'ocean' };

                let tileClasses = `map-tile tile-${tile.terrain}`;
                if (isFinalized && tile.terrain !== 'ocean') {
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
                        {tile.poiType && (
                            <div className={`poi-marker ${isFinalized ? 'clickable' : ''}`} title={tile.label || 'Undefined Location'}>
                                {getPoiIcon(tile.poiType)}
                                <span className="poi-label">{tile.label || '?'}</span>
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
                    {context.type === 'world' ? 'World Map' : 'Dungeon Layout'}
                </h3>
                <button
                    className="campaign-btn campaign-btn-primary"
                    onClick={() => saveMapReference({ ...currentMap, isFinalized: !isFinalized })}
                >
                    {isFinalized ? '✏️ Edit Map' : '✅ Finalize Map'}
                </button>
            </div>

            {isLocationPromptOpen && (
                <div className="map-maker-modal-overlay">
                    <div className="map-maker-modal">
                        <h3>Define {pendingPoiTile?.poiType || 'Location'}</h3>
                        <p>Provide details for this point of interest.</p>
                        <div className="campaign-form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={promptLabel}
                                onChange={(e) => setPromptLabel(e.target.value)}
                                placeholder="Location name..."
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (context.type !== 'world' || selectedRegionIdForLocation)) handleSavePoi();
                                    if (e.key === 'Escape') {
                                        setIsLocationPromptOpen(false);
                                        setPendingPoiTile(null);
                                    }
                                }}
                            />
                        </div>

                        {context.type === 'world' && (
                            <div className="campaign-form-group" style={{ marginTop: '1rem' }}>
                                <label>Assign to Region (Required)</label>
                                <select
                                    className="app__select"
                                    value={selectedRegionIdForLocation}
                                    onChange={(e) => setSelectedRegionIdForLocation(e.target.value)}
                                >
                                    <option value="">-- Select a Region --</option>
                                    {data.regions.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {context.type === 'dungeon' && (
                            <div className="campaign-form-group" style={{ marginTop: '1rem' }}>
                                <label>Description / Mechanics</label>
                                <textarea
                                    value={promptDescription}
                                    onChange={(e) => setPromptDescription(e.target.value)}
                                    placeholder="Enter trap mechanics, loot contents, etc..."
                                    rows={3}
                                />
                            </div>
                        )}

                        <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                            <button className="campaign-btn campaign-btn-primary" onClick={handleSavePoi} disabled={context.type === 'world' && !selectedRegionIdForLocation}>Save Location</button>
                            <button className="campaign-btn campaign-btn-secondary" onClick={() => { setIsLocationPromptOpen(false); setPendingPoiTile(null); }}>Cancel</button>
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
                            className={`tool-btn ${activeTool === 'terrain' ? 'active' : ''}`}
                            onClick={() => setActiveTool('terrain')}
                        >🌳 Terrain</button>
                        <button
                            className={`tool-btn ${activeTool === 'bucket' ? 'active' : ''}`}
                            onClick={() => setActiveTool('bucket')}
                        >🪣 Fill</button>
                        <button
                            className={`tool-btn ${activeTool === 'poi' ? 'active' : ''}`}
                            onClick={() => setActiveTool('poi')}
                        >📍 POI</button>
                        <button
                            className={`tool-btn ${activeTool === 'erase' ? 'active' : ''}`}
                            onClick={() => setActiveTool('erase')}
                        >🧹 Erase</button>
                    </div>

                    {(activeTool === 'terrain' || activeTool === 'bucket') && (
                        <div className="tool-group">
                            {context.type === 'world' ? (
                                (['ocean', 'lake', 'river', 'plain', 'grassland', 'forest', 'jungle', 'mountain', 'desert', 'wetland', 'taiga'] as MapTerrain[]).map(t => (
                                    <button
                                        key={t}
                                        className={`tool-btn ${selectedTerrain === t ? 'active' : ''}`}
                                        onClick={() => setSelectedTerrain(t)}
                                        style={{ textTransform: 'capitalize' }}
                                    >{t}</button>
                                ))
                            ) : (
                                (['stone', 'wood', 'magic', 'lava', 'poison', 'cursed', 'haunted', 'fae', 'arcane', 'darkness', 'gold', 'river', 'lake'] as MapTerrain[]).map(t => (
                                    <button
                                        key={t}
                                        className={`tool-btn ${selectedTerrain === t ? 'active' : ''}`}
                                        onClick={() => setSelectedTerrain(t)}
                                        style={{ textTransform: 'capitalize' }}
                                    >{t}</button>
                                ))
                            )}
                        </div>
                    )}

                    {activeTool === 'poi' && (
                        <div className="tool-group">
                            {context.type === 'world' ? (
                                (['village', 'town', 'city', 'dungeon', 'quest'] as MapPoiType[]).map(t => (
                                    <button
                                        key={t}
                                        className={`tool-btn ${selectedPoiType === t ? 'active' : ''}`}
                                        onClick={() => setSelectedPoiType(t)}
                                        style={{ textTransform: 'capitalize' }}
                                    >
                                        {getPoiIcon(t)} {t}
                                    </button>
                                ))
                            ) : (
                                (['encounter', 'loot', 'trap', 'secret'] as MapPoiType[]).map(t => (
                                    <button
                                        key={t}
                                        className={`tool-btn ${selectedPoiType === t ? 'active' : ''}`}
                                        onClick={() => setSelectedPoiType(t)}
                                        style={{ textTransform: 'capitalize' }}
                                    >
                                        {getPoiIcon(t)} {t}
                                    </button>
                                ))
                            )}
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
