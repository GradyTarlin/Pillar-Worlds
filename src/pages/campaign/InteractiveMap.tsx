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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const mapLocations = data.locations;

    useEffect(() => {
        let active = true;
        if (data.mapImageId) {
            getMapImage(data.mapImageId).then(src => {
                if (active && src) setImgSrc(src);
            });
        } else {
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
            <header className="campaign-card-header">
                <h2>Interactive Map</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>Click anywhere to add a pin.</div>
            </header>

            {!imgSrc ? (
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
                        <div
                            className="pin-add-form"
                            style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 100 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h4>{editingPinId ? 'Edit Pin' : 'Link Pin'}</h4>
                            <select
                                value={selectedLocIdForPin}
                                onChange={e => setSelectedLocIdForPin(e.target.value)}
                                className="app__input"
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
                    )}

                    <div
                        className="map-image-container"
                        onClick={handleMapClick}
                    >
                        <img src={imgSrc} alt="World Map" className="map-image" draggable="false" />

                        {(data.mapPins || []).map(pin => (
                            <div
                                key={pin.id}
                                className={`map-pin ${editingPinId === pin.id ? 'editing' : ''}`}
                                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
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
                                style={{ left: `${newPinPos.x}%`, top: `${newPinPos.y}%` }}
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
