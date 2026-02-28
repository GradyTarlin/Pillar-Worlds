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
    const [isAddingPin, setIsAddingPin] = useState(false);
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
        if (!isAddingPin) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setNewPinPos({ x, y });
    };

    const handleSavePin = () => {
        if (!newPinPos || !selectedLocIdForPin) return;

        const newPin: MapPin = {
            id: `pin_${Date.now()}`,
            x: newPinPos.x,
            y: newPinPos.y,
            locationId: selectedLocIdForPin
        };

        const pins = data.mapPins || [];
        updateEntities('mapPins', [...pins, newPin]);

        setNewPinPos(null);
        setIsAddingPin(false);
        setSelectedLocIdForPin('');
    };

    const handleCancelPin = () => {
        setNewPinPos(null);
        setIsAddingPin(false);
    };

    const handleDeletePin = (pinId: string) => {
        if (confirm("Delete this pin?")) {
            const pins = data.mapPins || [];
            updateEntities('mapPins', pins.filter(p => p.id !== pinId));
        }
    };

    const getLocationName = (locId: string) => {
        const loc = mapLocations.find(l => l.id === locId);
        return loc ? loc.name : 'Unknown';
    };

    return (
        <section className="campaign-card interactive-map-view">
            <header className="campaign-card-header">
                <h2>World Map</h2>
                {imgSrc && (
                    <button
                        className={`campaign-btn ${isAddingPin ? 'campaign-btn-secondary' : 'campaign-btn-primary'}`}
                        onClick={() => setIsAddingPin(!isAddingPin)}
                    >
                        {isAddingPin ? 'Cancel Pin' : '+ Add Pin'}
                    </button>
                )}
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
                    {isAddingPin && newPinPos && (
                        <div className="pin-add-form">
                            <h4>Link Pin to Location</h4>
                            <select
                                value={selectedLocIdForPin}
                                onChange={e => setSelectedLocIdForPin(e.target.value)}
                            >
                                <option value="">Select a location...</option>
                                {mapLocations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name} ({loc.type})</option>
                                ))}
                            </select>
                            <div className="pin-form-actions">
                                <button className="campaign-btn" onClick={handleSavePin} disabled={!selectedLocIdForPin}>Save</button>
                                <button className="campaign-btn campaign-btn-danger" onClick={handleCancelPin}>Cancel</button>
                            </div>
                        </div>
                    )}

                    <div
                        className={`map-image-container ${isAddingPin ? 'crosshair' : ''}`}
                        onClick={handleMapClick}
                    >
                        <img src={imgSrc} alt="World Map" className="map-image" />

                        {(data.mapPins || []).map(pin => (
                            <div
                                key={pin.id}
                                className="map-pin"
                                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isAddingPin) {
                                        handleDeletePin(pin.id);
                                    } else {
                                        onSelectLocation(pin.locationId);
                                    }
                                }}
                                title={getLocationName(pin.locationId)}
                            >
                                📍
                                <span className="pin-label">{getLocationName(pin.locationId)}</span>
                            </div>
                        ))}

                        {newPinPos && isAddingPin && (
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
