import { useState, useRef, useCallback } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import type { MapBiome, MapFeature, MapTile, MapPoiType } from '../../types/campaign';
import './MapMaker.css';

type ToolMode = 'biome' | 'water' | 'poi' | 'erase';

export function MapMaker() {
    const { data, updateEntities } = useCampaignData();
    const [activeTool, setActiveTool] = useState<ToolMode>('biome');
    const [selectedBiome, setSelectedBiome] = useState<MapBiome>('grassland');
    const [selectedFeature, setSelectedFeature] = useState<MapFeature>('river');
    const [selectedPoiType, setSelectedPoiType] = useState<MapPoiType>('town');
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [history, setHistory] = useState<Record<string, MapTile>[]>([]);

    // Default map size
    const WIDTH = 60;
    const HEIGHT = 45;

    const canvasRef = useRef<HTMLDivElement>(null);

    const saveHistory = useCallback(() => {
        const currentGrid = data.customMap?.grid || {};
        setHistory(prev => [...prev, { ...currentGrid }]);
    }, [data.customMap?.grid]);

    const undo = () => {
        if (history.length === 0) return;
        const previousGrid = history[history.length - 1];
        const newHistory = history.slice(0, -1);

        const currentMap = data.customMap || { width: WIDTH, height: HEIGHT, grid: {} };
        updateEntities('customMap', { ...currentMap, grid: previousGrid });
        setHistory(newHistory);
    };

    const handleTileInteraction = useCallback((x: number, y: number, isInitialClick: boolean = false) => {
        const currentMap = data.customMap || { width: WIDTH, height: HEIGHT, grid: {} };
        const key = `${x},${y}`;
        const newGrid = { ...currentMap.grid };
        const currentTile = newGrid[key] || { biome: 'ocean', feature: 'none' };

        if (activeTool === 'biome') {
            newGrid[key] = { ...currentTile, biome: selectedBiome };
        } else if (activeTool === 'water') {
            newGrid[key] = { ...currentTile, feature: selectedFeature };
        } else if (activeTool === 'poi') {
            // POIs should ONLY trigger on the initial click, never on drag
            if (!isInitialClick) return;

            const label = prompt('Enter a label for this location:');
            if (label !== null) {
                saveHistory();
                newGrid[key] = { ...currentTile, poiId: `poi_${Date.now()}`, poiType: selectedPoiType, label };
            } else {
                return; // User cancelled prompt
            }
        } else if (activeTool === 'erase') {
            newGrid[key] = { ...currentTile, feature: 'none' };
            delete newGrid[key].poiId;
            delete newGrid[key].poiType;
            delete newGrid[key].label;
        }

        updateEntities('customMap', { ...currentMap, grid: newGrid });
    }, [data.customMap, activeTool, selectedBiome, selectedFeature, selectedPoiType, updateEntities, saveHistory]);

    const getPoiIcon = (type?: MapPoiType) => {
        switch (type) {
            case 'town': return '🏘️';
            case 'city': return '🏰';
            case 'dungeon': return '⚔️';
            case 'mystery': return '❓';
            default: return '🏘️';
        }
    };

    const renderGrid = () => {
        const tiles = [];
        const currentMap = data.customMap || { width: WIDTH, height: HEIGHT, grid: {} };

        for (let y = 0; y < currentMap.height; y++) {
            for (let x = 0; x < currentMap.width; x++) {
                const key = `${x},${y}`;
                const tile = currentMap.grid[key] || { biome: 'ocean', feature: 'none' };

                tiles.push(
                    <div
                        key={key}
                        className={`map-tile tile-${tile.biome} ${tile.feature !== 'none' ? `feature-${tile.feature}` : ''}`}
                        onMouseDown={() => {
                            if (activeTool !== 'poi') saveHistory();
                            setIsMouseDown(true);
                            handleTileInteraction(x, y, true);
                        }}
                        onMouseEnter={() => { if (isMouseDown) handleTileInteraction(x, y, false); }}
                        onMouseUp={() => setIsMouseDown(false)}
                    >
                        {tile.poiId && (
                            <div className="poi-marker" title={tile.label}>
                                {getPoiIcon(tile.poiType)}
                                <span className="poi-label">{tile.label}</span>
                            </div>
                        )}
                    </div>
                );
            }
        }
        return tiles;
    };

    return (
        <div className="map-maker-container" onMouseLeave={() => setIsMouseDown(false)}>
            <div className="map-maker-toolbar">
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
                        {(['town', 'city', 'dungeon', 'mystery'] as MapPoiType[]).map(t => (
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
                    <button className="tool-btn" onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}>➕</button>
                    <button className="tool-btn" onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}>➖</button>
                </div>
            </div>

            <div className="map-grid-viewport" ref={canvasRef}>
                <div
                    className="map-grid"
                    style={{
                        gridTemplateColumns: `repeat(${data.customMap?.width || WIDTH}, 32px)`,
                        transform: `scale(${zoom})`,
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
