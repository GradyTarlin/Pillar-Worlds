import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import type { Bloodline } from '../types';

interface BloodlineCarouselProps {
  bloodlines: Bloodline[];
  selected: Bloodline | null;
  onSelect: (bloodline: Bloodline) => void;
  isComplete: boolean;
  renderSelectedDetail?: (bloodline: Bloodline) => ReactNode;
}

const SWIPE_THRESHOLD = 45;

export function BloodlineCarousel({
  bloodlines,
  selected,
  onSelect,
  isComplete,
  renderSelectedDetail,
}: BloodlineCarouselProps) {
  const selectedIndex = selected
    ? bloodlines.findIndex((bloodline) => bloodline.id === selected.id)
    : -1;
  const [failedImageId, setFailedImageId] = useState<string | null>(null);
  const pointerStartX = useRef<number | null>(null);

  if (bloodlines.length === 0) {
    return null;
  }

  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const activeBloodline = bloodlines[activeIndex];
  const activeIsSelected = selected?.id === activeBloodline.id;

  const selectAtIndex = (index: number) => {
    const wrappedIndex = (index + bloodlines.length) % bloodlines.length;
    onSelect(bloodlines[wrappedIndex]);
  };

  const move = (direction: -1 | 1) => {
    selectAtIndex(activeIndex + direction);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectAtIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectAtIndex(bloodlines.length - 1);
    } else if ((event.key === 'Enter' || event.key === ' ') && !activeIsSelected) {
      event.preventDefault();
      onSelect(activeBloodline);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') {
      pointerStartX.current = event.clientX;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null) {
      return;
    }

    const distance = event.clientX - pointerStartX.current;
    pointerStartX.current = null;

    if (Math.abs(distance) >= SWIPE_THRESHOLD) {
      move(distance > 0 ? -1 : 1);
    }
  };

  const hasImage = activeBloodline.imageUrl && failedImageId !== activeBloodline.id;

  return (
    <section
      className={`selection-section bloodline-carousel ${isComplete ? 'selection-section--complete' : 'selection-section--pending'}`}
      aria-labelledby="bloodline-carousel-title"
    >
      <h3 id="bloodline-carousel-title" className="selection-section__title">Bloodline</h3>
      <p className="selection-section__subheading">
        Your ancestry — each grants a unique racial feature.
      </p>

      <div className="bloodline-carousel__layout">
        <button
          type="button"
          className="bloodline-carousel__control"
          onClick={() => move(-1)}
          aria-label="Select previous bloodline"
        >
          <span aria-hidden="true">‹</span>
        </button>

        <div
          className="bloodline-carousel__viewport"
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label="Playable bloodlines. Use the left and right arrow keys to change bloodline."
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            pointerStartX.current = null;
          }}
        >
          <article
            className={`bloodline-card ${activeIsSelected ? 'bloodline-card--selected' : ''}`}
            aria-label={`${activeBloodline.name}, bloodline ${activeIndex + 1} of ${bloodlines.length}${activeIsSelected ? ', selected' : ''}`}
          >
            <div className="bloodline-card__art">
              {hasImage ? (
                <img
                  src={activeBloodline.imageUrl}
                  alt={`${activeBloodline.name} bloodline artwork`}
                  onError={() => setFailedImageId(activeBloodline.id)}
                />
              ) : (
                <div className="bloodline-card__art-fallback" role="img" aria-label={`No bloodline artwork available for ${activeBloodline.name}`}>
                  <span className="bloodline-card__sigil" aria-hidden="true">
                    {activeBloodline.name.charAt(0)}
                  </span>
                  <span>No artwork available</span>
                </div>
              )}
              <span className="bloodline-card__position">
                {activeIndex + 1} / {bloodlines.length}
              </span>
            </div>

            <div className="bloodline-card__content">
              <div className="bloodline-card__heading">
                <div>
                  <p className="bloodline-card__type">{activeBloodline.type}</p>
                  <h4>{activeBloodline.name}</h4>
                </div>
              </div>

              <div className="bloodline-card__ability">
                <span>Bloodline feature</span>
                <strong>{activeBloodline.featureName}</strong>
                {activeBloodline.featureDescription && (
                  <p className="bloodline-card__ability-flavour">{activeBloodline.featureDescription}</p>
                )}
                <p>{activeBloodline.featureText}</p>
              </div>

              <div className="bloodline-card__description">
                <span>Description</span>
                <p>{activeBloodline.description ?? 'No additional description is available in the current rules data.'}</p>
              </div>

              {!activeIsSelected && (
                <button
                  type="button"
                  className="bloodline-card__select"
                  onClick={() => onSelect(activeBloodline)}
                  aria-label={`Select ${activeBloodline.name} as your bloodline`}
                >
                  Select {activeBloodline.name}
                </button>
              )}

              {activeIsSelected && renderSelectedDetail && renderSelectedDetail(activeBloodline)}
            </div>
          </article>
        </div>

        <button
          type="button"
          className="bloodline-carousel__control"
          onClick={() => move(1)}
          aria-label="Select next bloodline"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div className="bloodline-carousel__indicators" role="group" aria-label="Choose a bloodline">
        {bloodlines.map((bloodline, index) => (
          <button
            key={bloodline.id}
            type="button"
            className={`bloodline-carousel__indicator ${index === activeIndex ? 'bloodline-carousel__indicator--active' : ''}`}
            onClick={() => selectAtIndex(index)}
            aria-label={`Select ${bloodline.name}`}
            aria-pressed={selected?.id === bloodline.id}
          />
        ))}
      </div>

      <p className="bloodline-carousel__status" aria-live="polite">
        {activeBloodline.name}{activeIsSelected ? ' selected' : ' preview'}
      </p>
    </section>
  );
}
