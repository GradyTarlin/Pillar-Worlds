import { useState, useRef, useCallback } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import type { MapBiome, MapFeature } from '../../types/campaign';
import './MapMaker.css';

type ToolMode = 'biome' | 'water' | 'poi' | 'erase';

export function MapMaker() {
    const { data, updateEntities } = useCampaignData();
    const [activeTool, setActiveTool] = useState<ToolMode>('biome');
    const [selectedBiome, setSelectedBiome] = useState<MapBiome>('grassland');
    const [selectedFeature, setSelectedFeature] = useState<MapFeature>('river');
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [zoom, setZoom] = useState(1);

    // Default map size
    const WIDTH = 60;
    const HEIGHT = 45;

    const canvasRef = useRef<HTMLDivElement>(null);

    const handleTileInteraction = useCallback((x: number, y: number) => {
        const currentMap = data.customMap || { width: WIDTH, height: HEIGHT, grid: {} };
        const key = `${x},${y}`;
        const newGrid = { ...currentMap.grid };
        const currentTile = newGrid[key] || { biome: 'ocean', feature: 'none' };

        if (activeTool === 'biome') {
            newGrid[key] = { ...currentTile, biome: selectedBiome };
        } else if (activeTool === 'water') {
            newGrid[key] = { ...currentTile, feature: selectedFeature };
        } else if (activeTool === 'poi') {
            const label = prompt('Enter a label for this location:');
            if (label !== null) {
                newGrid[key] = { ...currentTile, poiId: `poi_${Date.now()}`, label };
            }
        } else if (activeTool === 'erase') {
            delete newGrid[key];
        }

        updateEntities('customMap', { ...currentMap, grid: newGrid });
    }, [data.customMap, activeTool, selectedBiome, selectedFeature, updateEntities]);

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
                        onMouseDown={() => { setIsMouseDown(true); handleTileInteraction(x, y); }}
                        onMouseEnter={() => { if (isMouseDown) handleTileInteraction(x, y); }}
                        onMouseUp={() => setIsMouseDown(false)}
                    >
                        {tile.poiId && (
                            <div className="poi-marker" title={tile.label}>
                                {tile.label?.includes('Dungeon') || tile.poiId.includes('dungeon') ? '⚔️' : '🏘️'}
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

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
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
