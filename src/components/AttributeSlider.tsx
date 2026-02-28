import React from 'react';
import '../App.css';

interface AttributeSliderProps<T> {
    title: string;
    subheading: string;
    options: T[];
    selected: T | null;
    onSelect: (option: T) => void;
    getOptionName: (option: T) => string;
    renderSelectedDetail?: (option: T) => React.ReactNode;
}

export function AttributeSlider<T>({
    title,
    subheading,
    options,
    selected,
    onSelect,
    getOptionName,
    renderSelectedDetail,
}: AttributeSliderProps<T>) {
    if (options.length !== 3) {
        console.warn('AttributeSlider expects exactly 3 options.');
    }

    const selectedIndex = selected ? options.indexOf(selected) : 1; // Default to middle if null

    // Auto-select middle option on mount if nothing is selected
    React.useEffect(() => {
        if (!selected && options.length === 3) {
            onSelect(options[1]);
        }
    }, [selected, options, onSelect]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const index = parseInt(e.target.value, 10);
        onSelect(options[index]);
    };

    return (
        <div className="attribute-slider-container">
            <div className="selection-section__header-row">
                <h3 className="selection-section__title" style={{ margin: 0 }}>
                    {title}
                </h3>
                <span className="selection-section__subheading" style={{ margin: 0, paddingLeft: '1rem' }}>
                    {subheading}
                </span>
            </div>

            <div className="attribute-slider-track">
                <div className="attribute-slider-labels">
                    <span className={selectedIndex === 0 ? 'active' : ''}>{getOptionName(options[0])}</span>
                    <span className={selectedIndex === 1 ? 'active' : ''}>{getOptionName(options[1])}</span>
                    <span className={selectedIndex === 2 ? 'active' : ''}>{getOptionName(options[2])}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="2"
                    step="1"
                    value={selectedIndex}
                    onChange={handleChange}
                    className="attribute-slider-input"
                />
                <div className="attribute-slider-ticks">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

            {selected && renderSelectedDetail && (
                <div className="attribute-slider-detail">
                    {renderSelectedDetail(selected)}
                </div>
            )}
        </div>
    );
}
