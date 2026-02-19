import type { ReactNode } from 'react';

interface SelectionSectionProps<T> {
  title: string;
  subheading?: string;
  options: T[];
  selected: T | null;
  onSelect: (option: T) => void;
  getOptionId: (option: T) => string;
  getOptionName: (option: T) => string;
  renderOptionContent?: (option: T) => ReactNode;
  renderSelectedDetail?: (option: T) => ReactNode;
  ghostUnselectedWhenSelected?: boolean;
  isComplete?: boolean;
}

export function SelectionSection<T>({
  title,
  subheading,
  options,
  selected,
  onSelect,
  getOptionId,
  getOptionName,
  renderOptionContent,
  renderSelectedDetail,
  ghostUnselectedWhenSelected = false,
  isComplete = false,
}: SelectionSectionProps<T>) {
  return (
    <section
      className={`selection-section ${isComplete ? 'selection-section--complete' : 'selection-section--pending'}`}
    >
      <h3 className="selection-section__title">{title}</h3>
      {subheading && <p className="selection-section__subheading">{subheading}</p>}
      <div className="selection-section__options">
        {options.map((option) => {
          const id = getOptionId(option);
          const isSelected = selected && getOptionId(selected) === id;
          const isGhosted = ghostUnselectedWhenSelected && selected && !isSelected;
          return (
            <button
              key={id}
              type="button"
              className={`selection-section__option ${isSelected ? 'selection-section__option--selected' : ''} ${isGhosted ? 'selection-section__option--ghosted' : ''}`}
              onClick={() => onSelect(option)}
            >
              {renderOptionContent ? renderOptionContent(option) : getOptionName(option)}
            </button>
          );
        })}
      </div>
      {selected && renderSelectedDetail && (
        <div className="selection-section__detail">{renderSelectedDetail(selected)}</div>
      )}
    </section>
  );
}
