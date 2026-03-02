import { useState, useRef, useEffect } from 'react';
import { useCampaignData } from '../../hooks/useCampaignData';
import { saveMapImage, getMapImage, deleteMapImage } from '../../utils/imageDB';
import type { MapPin } from '../../types/campaign';
import './InteractiveMap.css';

interface InteractiveMapProps {
    onSelectLocation: (id: string) => void;
}

export function InteractiveMap({ onSelectLocation }: InteractiveMapProps) {
    const { data, updateEntities } = useCampaignData();
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [editingPinId, setEditingPinId] = useState<string | null>(null);
    const [newPinPos, setNewPinPos] = useState<{ x: number, y: number } | null>(null);
    const [selectedLocIdForPin, setSelectedLocIdForPin] = useState('');
    const [mapSource, setMapSource] = useState<'image' | 'custom'>('image');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const mapLocations = data.locations;

    useEffect(() => {
        let active = true;
        if (data.mapImageId) {
            getMapImage(data.mapImageId).then(src => {
                if (active && src) setImgSrc(src);
            });
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setImgSrc(null);
        }
        return () => { active = false; };
    }, [data.mapImageId]);



    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const imgId = `map_world_${Date.now()}`;
        await saveMapImage(imgId, file);

        // Delete old image if it exists
        if (data.mapImageId) {
            await deleteMapImage(data.mapImageId);
        }

        updateEntities('mapImageId', imgId);
    };

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setNewPinPos({ x, y });
        setEditingPinId(null);
    };



    const handleSavePin = () => {
        if (!newPinPos || !selectedLocIdForPin) return;

        const pins = data.mapPins || [];

        if (editingPinId) {
            updateEntities('mapPins', pins.map(p => p.id === editingPinId ? { ...p, locationId: selectedLocIdForPin } : p));
        } else {
            const newPin: MapPin = {
                id: `pin_${Date.now()}`,
                x: newPinPos.x,
                y: newPinPos.y,
                locationId: selectedLocIdForPin
            };
            updateEntities('mapPins', [...pins, newPin]);
        }

        setNewPinPos(null);
        setEditingPinId(null);
        setSelectedLocIdForPin('');
    };

    const handleCancelPin = () => {
        setNewPinPos(null);
        setEditingPinId(null);
    };

    const handleDeletePin = (pinId: string) => {
        if (confirm("Delete this pin?")) {
            const pins = data.mapPins || [];
            updateEntities('mapPins', pins.filter(p => p.id !== pinId));
            handleCancelPin();
        }
    };

    const getLocationName = (locId: string) => {
        const loc = mapLocations.find(l => l.id === locId);
        return loc ? loc.name : 'Unknown';
    };

    return (
        <section className="campaign-card interactive-map-view">
            <header className="campaign-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2>Interactive Map</h2>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>Click anywhere to add a pin.</div>
                </div>
                {data.customMap && Object.keys(data.customMap.grid).length > 0 && (
                    <div className="map-source-toggle">
                        <button
                            className={`campaign-btn ${mapSource === 'image' ? 'active' : ''}`}
                            onClick={() => setMapSource('image')}
                            style={{ padding: '4px 12px', fontSize: '0.8rem', borderRadius: '4px 0 0 4px' }}
                        >🖼️ Image</button>
                        <button
                            className={`campaign-btn ${mapSource === 'custom' ? 'active' : ''}`}
                            onClick={() => setMapSource('custom')}
                            style={{ padding: '4px 12px', fontSize: '0.8rem', borderRadius: '0 4px 4px 0', borderLeft: 'none' }}
                        >🗺️ Custom</button>
                    </div>
                )}
            </header>

            {mapSource === 'image' && !imgSrc ? (
                <div className="map-upload-state">
                    <p>No map uploaded for this region.</p>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        style={{ display: 'none' }}
                    />
                    <button className="campaign-btn campaign-btn-primary" onClick={() => fileInputRef.current?.click()}>
                        Upload Map Image
                    </button>
                    <p className="upload-hint">Uploads are stored locally in your browser to bypass storage limits.</p>
                </div>
            ) : (
                <div className="map-container-wrapper">

                    {(newPinPos || editingPinId) && (
                        <div style={{ position: 'sticky', top: '80px', height: 0, zIndex: 1000, alignSelf: 'flex-end' }}>
                            <div
                                className="pin-add-form"
                                style={{ position: 'absolute', top: '10px', right: '10px' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h4>{editingPinId ? 'Edit Pin' : 'Link Pin'}</h4>
                                <select
                                    value={selectedLocIdForPin}
                                    onChange={e => setSelectedLocIdForPin(e.target.value)}
                                    className="app__select"
                                >
                                    <option value="">Select a location...</option>
                                    {mapLocations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name} ({loc.type})</option>
                                    ))}
                                </select>
                                <div className="pin-form-actions">
                                    <button className="campaign-btn campaign-btn-primary" onClick={handleSavePin} disabled={!selectedLocIdForPin}>Save</button>
                                    {editingPinId && (
                                        <>
                                            <button className="campaign-btn campaign-btn-secondary" onClick={() => onSelectLocation(selectedLocIdForPin)}>Go To Location</button>
                                            <button className="campaign-btn campaign-btn-danger" onClick={() => handleDeletePin(editingPinId)}>Delete</button>
                                        </>
                                    )}
                                    <button className="campaign-btn campaign-btn-secondary" onClick={handleCancelPin}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div
                        className="map-image-container"
                        onClick={handleMapClick}
                        style={{
                            background: mapSource === 'custom' ? '#21618c' : 'transparent',
                            overflow: mapSource === 'custom' ? 'auto' : 'visible'
                        }}
                    >
                        {mapSource === 'image' ? (
                            <img src={imgSrc!} alt="World Map" className="map-image" draggable="false" />
                        ) : (
                            <div
                                className="custom-map-render"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${data.customMap?.width || 60}, 24px)`,
                                    width: 'fit-content'
                                }}
                            >
                                {(() => {
                                    const tiles = [];
                                    const currentMap = data.customMap!;
                                    for (let y = 0; y < currentMap.height; y++) {
                                        for (let x = 0; x < currentMap.width; x++) {
                                            const tile = currentMap.grid[`${x},${y}`] || { biome: 'ocean', feature: 'none' };
                                            tiles.push(
                                                <div
                                                    key={`${x},${y}`}
                                                    className={`map-tile tile-${tile.biome} ${tile.feature !== 'none' ? `feature-${tile.feature}` : ''}`}
                                                    style={{ width: '24px', height: '24px', border: 'none' }}
                                                >
                                                    {tile.poiId && (
                                                        <div className="poi-marker" style={{ fontSize: '0.8rem' }}>
                                                            {tile.label?.includes('Dungeon') ? '⚔️' : '🏘️'}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    }
                                    return tiles;
                                })()}
                            </div>
                        )}

                        {(data.mapPins || []).map(pin => (
                            <div
                                key={pin.id}
                                className={`map-pin ${editingPinId === pin.id ? 'editing' : ''}`}
                                style={{
                                    left: mapSource === 'image' ? `${pin.x}%` : `${(pin.x / 100) * (data.customMap?.width || 60) * 24}px`,
                                    top: mapSource === 'image' ? `${pin.y}%` : `${(pin.y / 100) * (data.customMap?.height || 45) * 24}px`
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingPinId(pin.id);
                                    setSelectedLocIdForPin(pin.locationId);
                                    setNewPinPos(null);
                                }}
                                title={getLocationName(pin.locationId)}
                            >
                                📍
                                <span className="pin-label">{getLocationName(pin.locationId)}</span>
                            </div>
                        ))}

                        {newPinPos && (
                            <div
                                className="map-pin new-pin pulse"
                                style={{
                                    left: mapSource === 'image' ? `${newPinPos.x}%` : `${(newPinPos.x / 100) * (data.customMap?.width || 60) * 24}px`,
                                    top: mapSource === 'image' ? `${newPinPos.y}%` : `${(newPinPos.y / 100) * (data.customMap?.height || 45) * 24}px`
                                }}
                            >
                                📍
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
