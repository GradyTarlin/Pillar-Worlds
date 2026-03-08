import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import type { MapTerrain, MapTile, MapPoiType, CustomMap, Region, Quest, Location as CampaignLocation } from '../../types/campaign';
import './MapMaker.css';
import '../compendium/Compendium.css';

type ToolMode = 'terrain' | 'bucket' | 'poi' | 'erase' | 'move';

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
    const [activeTool, setActiveTool] = useState<ToolMode>('move');
    const [selectedTerrain, setSelectedTerrain] = useState<MapTerrain>(context.type === 'dungeon' ? 'stone' : 'grassland');
    const [selectedPoiType, setSelectedPoiType] = useState<MapPoiType>(context.type === 'dungeon' ? 'encounter' : 'town');
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragDistance, setDragDistance] = useState(0);
    const [history, setHistory] = useState<Record<string, MapTile>[]>([]);

    const [isLocationPromptOpen, setIsLocationPromptOpen] = useState(false);
    const [pendingPoiTile, setPendingPoiTile] = useState<{ x: number, y: number, poiType: MapPoiType } | null>(null);
    const [promptLabel, setPromptLabel] = useState('');
    const [promptDescription, setPromptDescription] = useState('');
    const [selectedRegionIdForLocation, setSelectedRegionIdForLocation] = useState<string>('');
    const [selectedExistingEntityId, setSelectedExistingEntityId] = useState<string>('new');

    const [inspectedPoiId, setInspectedPoiId] = useState<string | null>(null);

    const [isRegionPromptOpen, setIsRegionPromptOpen] = useState(false);
    const [pendingRegionTiles, setPendingRegionTiles] = useState<string[]>([]);
    const [selectedRegionIdForAssign, setSelectedRegionIdForAssign] = useState<string>('');
    const [newRegionName, setNewRegionName] = useState('');

    const [inspectedRegionId, setInspectedRegionId] = useState<string | null>(null);

    const [isEditingPoi, setIsEditingPoi] = useState(false);
    const [editPoiName, setEditPoiName] = useState('');
    const [editPoiDesc, setEditPoiDesc] = useState('');

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

    const inspectedEntity = React.useMemo(() => {
        if (!inspectedPoiId) return null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let entity: any = data.locations.find(l => l.id === inspectedPoiId);
        if (entity) return { ...entity, entityType: 'location' };
        entity = data.quests.find(q => q.id === inspectedPoiId);
        if (entity) return { ...entity, entityType: 'quest' };
        entity = data.encounters.find(e => e.id === inspectedPoiId);
        if (entity) return { ...entity, entityType: 'encounter' };

        const allTiles = Object.values(currentMap.grid);
        const tile = allTiles.find(t => t.poiId === inspectedPoiId);
        if (tile) {
            return {
                id: inspectedPoiId,
                name: tile.label || 'Unknown',
                description: tile.description || '',
                type: tile.poiType,
                entityType: 'generic'
            }
        }
        return null;
    }, [inspectedPoiId, data, currentMap.grid]);

    const placedPoiIds = React.useMemo(() => {
        const ids = new Set<string>();
        Object.values(currentMap.grid).forEach(tile => {
            if (tile.poiId) ids.add(tile.poiId);
        });
        return ids;
    }, [currentMap.grid]);

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

    const applyBounds = useCallback((newZoom?: number) => {
        if (!canvasRef.current) return;

        const viewportWidth = canvasRef.current.clientWidth;
        const viewportHeight = canvasRef.current.clientHeight;
        const gridNativeWidth = currentMap.width * 32;
        const gridNativeHeight = currentMap.height * 32;

        const minZoomX = viewportWidth / gridNativeWidth;
        const minZoomY = viewportHeight / gridNativeHeight;
        const minZoom = Math.min(minZoomX, minZoomY);

        setZoom(prevZoom => {
            const nextZoom = Math.max(minZoom, Math.min(newZoom ?? prevZoom, 3));

            setPan(prevPan => {
                const gridWidth = gridNativeWidth * nextZoom;
                const gridHeight = gridNativeHeight * nextZoom;
                let { x, y } = prevPan;

                if (gridWidth <= viewportWidth) x = (viewportWidth - gridWidth) / 2;
                else x = Math.min(0, Math.max(viewportWidth - gridWidth, x));

                if (gridHeight <= viewportHeight) y = (viewportHeight - gridHeight) / 2;
                else y = Math.min(0, Math.max(viewportHeight - gridHeight, y));

                return { x, y };
            });
            return nextZoom;
        });
    }, [currentMap.width, currentMap.height]);

    useEffect(() => {
        const handleResize = () => applyBounds();
        applyBounds();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [applyBounds]);

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
        const currentTile = newGrid[key] || { terrain: context.type === 'world' ? 'ocean' : 'darkness' };

        if (isFinalized && isInitialClick) {
            return; // Mode clicks when finalized are handled exclusively in handleTileClick
        }

        if (activeTool === 'terrain' && !isFinalized) {
            newGrid[key] = { ...currentTile, terrain: selectedTerrain };
        } else if (activeTool === 'bucket' && !isFinalized) {
            if (!isInitialClick) return;
            const targetTerrain = currentTile.terrain;
            if (targetTerrain === selectedTerrain) return;

            const areaToFill = getContiguousSameTerrain(x, y, targetTerrain, newGrid);
            areaToFill.forEach(k => {
                newGrid[k] = { ...newGrid[k], terrain: selectedTerrain };
            });
        } else if (activeTool === 'poi' && !isFinalized) {
            if (!isInitialClick) return;
            newGrid[key] = { ...currentTile, poiType: selectedPoiType };
        } else if (activeTool === 'erase' && !isFinalized) {
            if (currentTile.poiType || currentTile.poiId) {
                const updatedTile = { ...currentTile };
                delete updatedTile.poiId;
                delete updatedTile.poiType;
                delete updatedTile.label;
                delete updatedTile.description;
                newGrid[key] = updatedTile;
            } else {
                newGrid[key] = { terrain: context.type === 'world' ? 'ocean' : 'darkness' };
            }
        }

        saveMapReference({ ...currentMap, grid: newGrid });
    }, [currentMap, activeTool, selectedTerrain, selectedPoiType, isFinalized, saveMapReference, context.type]);

    const handleTileClick = useCallback((x: number, y: number) => {
        if (!isFinalized || dragDistance > 5) return;

        const key = `${x},${y}`;
        const currentTile = currentMap.grid[key] || { terrain: context.type === 'world' ? 'ocean' : 'darkness' };

        if (currentTile.poiType && !currentTile.poiId) {
            setPendingPoiTile({ x, y, poiType: currentTile.poiType });
            setPromptLabel('');
            setPromptDescription('');
            setSelectedRegionIdForLocation(currentTile.regionId || '');
            setSelectedExistingEntityId('new');
            setIsLocationPromptOpen(true);
            return;
        } else if (currentTile.poiId) {
            setInspectedPoiId(currentTile.poiId);
            return;
        } else if (currentTile.regionId) {
            setInspectedRegionId(currentTile.regionId);
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
    }, [isFinalized, dragDistance, currentMap, onSelectLocation, onSelectRegion, context.type]);

    const handleSavePoi = () => {
        if (!pendingPoiTile) return;
        if (selectedExistingEntityId === 'new' && !promptLabel.trim()) return;

        if (context.type === 'world' && !selectedRegionIdForLocation) return;

        const key = `${pendingPoiTile.x},${pendingPoiTile.y}`;
        const newGrid = { ...currentMap.grid };
        const currentTile = newGrid[key] || { terrain: context.type === 'world' ? 'ocean' : 'darkness' };

        saveHistory();

        let targetId = selectedExistingEntityId;

        if (selectedExistingEntityId === 'new') {
            targetId = `poi_${Date.now()}`;

            if (context.type === 'world') {
                if (pendingPoiTile.poiType === 'quest') {
                    updateEntities('quests', [...data.quests, {
                        id: targetId,
                        name: promptLabel.trim(),
                        description: promptDescription.trim() || 'A mysterious quest',
                        objective: 'Unknown',
                        reward: 'Unknown',
                        regionId: selectedRegionIdForLocation
                    } as Quest]);
                } else if (['village', 'town', 'city'].includes(pendingPoiTile.poiType)) {
                    updateEntities('locations', [...data.locations, {
                        id: targetId,
                        name: promptLabel.trim(),
                        description: promptDescription.trim() || 'A newly discovered settlement',
                        type: 'settlement',
                        settlementType: pendingPoiTile.poiType as 'village' | 'town' | 'city',
                        regionId: selectedRegionIdForLocation || undefined,
                        leader: '',
                        economy: 'farming',
                    } as CampaignLocation]);
                } else if (pendingPoiTile.poiType === 'dungeon') {
                    updateEntities('locations', [...data.locations, {
                        id: targetId,
                        name: promptLabel.trim(),
                        description: promptDescription.trim() || 'A newly discovered dungeon',
                        type: 'dungeon',
                        regionId: selectedRegionIdForLocation || undefined,
                        traps: '',
                        secrets: '',
                        loot: '',
                    } as CampaignLocation]);
                }
            } else if (context.type === 'dungeon' && pendingPoiTile.poiType === 'encounter') {
                updateEntities('encounters', [...(data.encounters || []), {
                    id: targetId,
                    name: promptLabel.trim(),
                    description: promptDescription.trim() || 'A deadly encounter',
                    locationId: context.id,
                    combatants: [],
                    round: 1,
                    activeTurnIndex: 0,
                    isFinished: false
                }]);
            }
        }

        let finalLabel = selectedExistingEntityId === 'new' ? promptLabel.trim() : undefined;
        let finalDesc = selectedExistingEntityId === 'new' ? promptDescription.trim() : undefined;

        if (selectedExistingEntityId !== 'new') {
            const existingEntity = pendingPoiTile.poiType === 'quest'
                ? data.quests.find(q => q.id === targetId)
                : data.locations.find(l => l.id === targetId);
            if (existingEntity) {
                finalLabel = existingEntity.name;
                finalDesc = existingEntity.description || '';
            }
        }

        newGrid[key] = {
            ...currentTile,
            poiId: targetId,
            poiType: pendingPoiTile.poiType,
            label: finalLabel,
            description: finalDesc,
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
                const tile = currentMap.grid[key] || { terrain: context.type === 'world' ? 'ocean' : 'darkness' };

                let tileClasses = `map-tile tile-${tile.terrain}`;
                if (isFinalized && tile.terrain !== 'ocean' && tile.terrain !== 'darkness') {
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
                            if (!isFinalized && activeTool !== 'move') {
                                if (activeTool !== 'poi') saveHistory();
                                setIsMouseDown(true);
                                handleTileInteraction(x, y, true);
                            }
                        }}
                        onMouseEnter={() => { if (isMouseDown && !isFinalized && activeTool !== 'move') handleTileInteraction(x, y, false); }}
                        onMouseUp={() => setIsMouseDown(false)}
                        onClick={() => {
                            if (dragDistance <= 5) handleTileClick(x, y);
                        }}
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

    const handleViewportPointerDown = (e: React.PointerEvent) => {
        if (activeTool === 'move' || isFinalized) {
            setIsDragging(true);
            setDragStart({ x: e.clientX, y: e.clientY });
            setDragDistance(0);
            // Removed e.currentTarget.setPointerCapture(e.pointerId) because it swallows click events on children!
        }
    };

    const handleViewportPointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        setDragDistance(prev => prev + Math.abs(deltaX) + Math.abs(deltaY));

        setPan(prevPan => {
            let newX = prevPan.x + deltaX;
            let newY = prevPan.y + deltaY;
            if (canvasRef.current) {
                const gridWidth = currentMap.width * 32 * zoom;
                const gridHeight = currentMap.height * 32 * zoom;
                const viewportWidth = canvasRef.current.clientWidth;
                const viewportHeight = canvasRef.current.clientHeight;

                if (gridWidth <= viewportWidth) newX = (viewportWidth - gridWidth) / 2;
                else newX = Math.min(0, Math.max(viewportWidth - gridWidth, newX));

                if (gridHeight <= viewportHeight) newY = (viewportHeight - gridHeight) / 2;
                else newY = Math.min(0, Math.max(viewportHeight - gridHeight, newY));
            }
            return { x: newX, y: newY };
        });
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleViewportPointerUp = () => {
        if (isDragging) {
            setIsDragging(false);
        }
    };

    return (
        <div
            className={`unified-map-container ${isFinalized ? 'view-mode' : 'edit-mode'}`}
            onMouseLeave={() => { setIsMouseDown(false); setIsDragging(false); }}
            onMouseUp={() => { setIsMouseDown(false); setIsDragging(false); }}
            onPointerLeave={() => setIsDragging(false)}
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

                        {context.type === 'world' && (
                            <div className="campaign-form-group" style={{ marginTop: '1rem' }}>
                                <label>Assign to Region (Required)</label>
                                <select
                                    className="app__select"
                                    value={selectedRegionIdForLocation}
                                    onChange={(e) => {
                                        setSelectedRegionIdForLocation(e.target.value);
                                        setSelectedExistingEntityId('new');
                                    }}
                                >
                                    <option value="">-- Select a Region --</option>
                                    {data.regions.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {context.type === 'world' && selectedRegionIdForLocation && (
                            <div className="campaign-form-group" style={{ marginTop: '1rem' }}>
                                <label>Existing {pendingPoiTile?.poiType}</label>
                                <select
                                    className="app__select"
                                    value={selectedExistingEntityId}
                                    onChange={(e) => {
                                        setSelectedExistingEntityId(e.target.value);
                                        if (e.target.value !== 'new') setPromptLabel('');
                                    }}
                                >
                                    <option value="new">-- Create New --</option>
                                    {pendingPoiTile?.poiType === 'quest' ? (
                                        data.quests.filter(q => q.regionId === selectedRegionIdForLocation && !placedPoiIds.has(q.id)).map(q => (
                                            <option key={q.id} value={q.id}>{q.name}</option>
                                        ))
                                    ) : (
                                        data.locations.filter(l => l.regionId === selectedRegionIdForLocation && (l.type === pendingPoiTile?.poiType || (l.type === 'settlement' && l.settlementType === pendingPoiTile?.poiType)) && !placedPoiIds.has(l.id)).map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                        )}

                        {selectedExistingEntityId === 'new' && (
                            <div className="campaign-form-group" style={{ marginTop: '1rem' }}>
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={promptLabel}
                                    onChange={(e) => setPromptLabel(e.target.value)}
                                    placeholder={`${pendingPoiTile?.poiType || 'Location'} name...`}
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
                        )}

                        {context.type === 'dungeon' && selectedExistingEntityId === 'new' && (
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
                            className={`tool-btn ${activeTool === 'move' ? 'active' : ''}`}
                            onClick={() => setActiveTool('move')}
                        >🖐️ Move</button>
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

            {inspectedRegionId && (() => {
                const region = data.regions.find(r => r.id === inspectedRegionId);
                if (!region) return null;
                const linkedLocations = data.locations.filter(loc => loc.regionId === region.id);
                const linkedQuests = data.quests.filter(q => q.regionId === region.id);
                return (
                    <div className="compendium-detail-container">
                        <div className="compendium-detail-overlay" onClick={() => setInspectedRegionId(null)}></div>
                        <div className="compendium-detail">
                            <button className="compendium-detail__close" onClick={() => { setInspectedRegionId(null); setIsEditingPoi(false); }}>✕</button>
                            <header className="compendium-detail__header">
                                <h2>{region.name}</h2>
                                <div className="compendium-detail__tags">
                                    <span className="compendium-detail__tag highlight">Region</span>
                                </div>
                            </header>
                            <div className="compendium-detail__content">
                                {isEditingPoi ? (
                                    <div className="campaign-entity-form" style={{ marginTop: '1rem' }}>
                                        <div className="campaign-form-group">
                                            <label>Name</label>
                                            <input
                                                type="text"
                                                value={editPoiName}
                                                onChange={(e) => setEditPoiName(e.target.value)}
                                                placeholder="Name..."
                                            />
                                        </div>
                                        <div className="campaign-form-group">
                                            <label>Description</label>
                                            <textarea
                                                value={editPoiDesc}
                                                onChange={(e) => setEditPoiDesc(e.target.value)}
                                                placeholder="Lore or specifics..."
                                                rows={4}
                                            />
                                        </div>
                                        <div className="campaign-form-actions">
                                            <button className="campaign-btn campaign-btn-primary" onClick={() => {
                                                updateEntities('regions', data.regions.map(r => r.id === region.id ? { ...r, name: editPoiName.trim(), description: editPoiDesc.trim() } : r));
                                                setIsEditingPoi(false);
                                            }}>Save</button>
                                            <button className="campaign-btn campaign-btn-secondary" onClick={() => setIsEditingPoi(false)}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {region.description && (
                                            <p className="compendium-detail__lore">{region.description}</p>
                                        )}

                                        <section className="compendium-detail__section">
                                            <h3>Notable Locations</h3>
                                            {linkedLocations.length === 0 ? (
                                                <p className="campaign-empty-state" style={{ padding: '0.5rem 0' }}>No documented locations.</p>
                                            ) : (
                                                <ul className="monster-traits-list">
                                                    {linkedLocations.map(loc => (
                                                        <li key={loc.id}>
                                                            <strong>{loc.name}</strong>
                                                            {loc.type && <span style={{ fontSize: '0.85em', color: 'var(--ink-muted)', marginLeft: '0.5rem', textTransform: 'capitalize' }}>({loc.type})</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </section>

                                        <section className="compendium-detail__section">
                                            <h3>Active Quests</h3>
                                            {linkedQuests.length === 0 ? (
                                                <p className="campaign-empty-state" style={{ padding: '0.5rem 0' }}>No known quests in this region.</p>
                                            ) : (
                                                <ul className="monster-traits-list">
                                                    {linkedQuests.map(q => (
                                                        <li key={q.id}>
                                                            <strong>{q.name}</strong>
                                                            {q.objective ? `: ${q.objective}` : ''}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </section>

                                        <button
                                            className="campaign-btn campaign-btn-secondary"
                                            style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem' }}
                                            onClick={() => {
                                                setEditPoiName(region.name);
                                                setEditPoiDesc(region.description || '');
                                                setIsEditingPoi(true);
                                            }}
                                        >
                                            ✏️ Edit Region
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {inspectedEntity && (
                <div className="compendium-detail-container">
                    <div className="compendium-detail-overlay" onClick={() => setInspectedPoiId(null)}></div>
                    <div className="compendium-detail">
                        <button className="compendium-detail__close" onClick={() => { setInspectedPoiId(null); setIsEditingPoi(false); }}>✕</button>
                        <header className="compendium-detail__header">
                            <h2>{inspectedEntity.name}</h2>
                            <div className="compendium-detail__tags">
                                <span className="compendium-detail__tag highlight">{inspectedEntity.type || 'POI'}</span>
                                {inspectedEntity.regionId && (
                                    <span className="compendium-detail__tag">{data.regions.find(r => r.id === inspectedEntity.regionId)?.name}</span>
                                )}
                            </div>
                        </header>
                        <div className="compendium-detail__content">
                            {inspectedEntity.description && (
                                <p className="compendium-detail__lore">{inspectedEntity.description}</p>
                            )}

                            {(inspectedEntity.type === 'settlement' || ['village', 'town', 'city'].includes(inspectedEntity.type || '')) && (
                                <>
                                    <section className="compendium-detail__section">
                                        <h3>Settlement Details</h3>
                                        <ul className="monster-stats-list" style={{ gap: '1rem', flexWrap: 'wrap', fontSize: '1rem' }}>
                                            {(inspectedEntity.settlementType || (inspectedEntity.type !== 'settlement' ? inspectedEntity.type : '')) && <li><strong>Type:</strong> <span style={{ textTransform: 'capitalize' }}>{inspectedEntity.settlementType || (inspectedEntity.type !== 'settlement' ? inspectedEntity.type : '')}</span></li>}
                                            {inspectedEntity.leader && <li><strong>Leader:</strong> {inspectedEntity.leader}</li>}
                                            {inspectedEntity.economy && <li><strong>Economy:</strong> <span style={{ textTransform: 'capitalize' }}>{inspectedEntity.economy}</span></li>}
                                        </ul>
                                    </section>
                                </>
                            )}

                            {inspectedEntity.type === 'dungeon' && (
                                <>
                                    <section className="compendium-detail__section">
                                        <h3>Dungeon Data</h3>
                                        <ul className="monster-traits-list">
                                            {inspectedEntity.traps && <li><strong>Traps:</strong> {inspectedEntity.traps}</li>}
                                            {inspectedEntity.secrets && <li><strong>Secrets:</strong> {inspectedEntity.secrets}</li>}
                                            {inspectedEntity.loot && <li><strong>Loot:</strong> {inspectedEntity.loot}</li>}
                                            {!inspectedEntity.traps && !inspectedEntity.secrets && !inspectedEntity.loot && <li>No specific mechanics defined.</li>}
                                        </ul>
                                    </section>
                                    <section className="compendium-detail__section">
                                        <h3>Encounters</h3>
                                        {(() => {
                                            const encounters = data.monsters.filter(m => m.dungeonId === inspectedEntity.id);
                                            if (encounters.length === 0) return <p className="campaign-empty-state" style={{ padding: '0.5rem 0' }}>No known monsters here.</p>;
                                            return (
                                                <ul className="monster-traits-list">
                                                    {encounters.map(m => (
                                                        <li key={m.id}>
                                                            <strong>{m.name}</strong>
                                                            {m.notes ? `: ${m.notes}` : ''}
                                                        </li>
                                                    ))}
                                                </ul>
                                            );
                                        })()}
                                    </section>
                                </>
                            )}

                            {inspectedEntity.entityType === 'quest' && (
                                <section className="compendium-detail__section">
                                    <h3>Quest Details</h3>
                                    <ul className="monster-traits-list">
                                        {inspectedEntity.objective && <li><strong>Objective:</strong> {inspectedEntity.objective}</li>}
                                        {inspectedEntity.reward && <li><strong>Reward:</strong> {inspectedEntity.reward}</li>}
                                    </ul>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div
                className={`map-grid-viewport ${context.type === 'dungeon' ? 'dungeon-viewport' : ''}`}
                ref={canvasRef}
                style={{ borderRadius: isFinalized ? '0 0 8px 8px' : '0', borderTop: 'none', cursor: (activeTool === 'move' || isFinalized) ? (isDragging ? 'grabbing' : 'grab') : 'crosshair' }}
                onPointerDown={handleViewportPointerDown}
                onPointerMove={handleViewportPointerMove}
                onPointerUp={handleViewportPointerUp}
                onPointerCancel={handleViewportPointerUp}
            >
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px', zIndex: 10 }}>
                    <button className="control-btn" onClick={() => applyBounds(zoom + 0.1)}>➕</button>
                    <button className="control-btn" onClick={() => applyBounds(zoom - 0.1)}>➖</button>
                </div>
                <div
                    className="map-grid"
                    style={{
                        gridTemplateColumns: `repeat(${currentMap.width}, 32px)`,
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: 'top left',
                        width: 'fit-content'
                    }}
                >
                    {renderGrid()}
                </div>
            </div>
        </div>
    );
}
