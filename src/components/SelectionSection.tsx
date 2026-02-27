import { useMemo, type ReactNode } from 'react';

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
  variant?: 'buttons' | 'dropdown';
  getOptionGroup?: (option: T) => string;
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
  variant = 'buttons',
  getOptionGroup,
}: SelectionSectionProps<T>) {
  const groupedOptions = useMemo(() => {
    if (!getOptionGroup) return null;
    const groups: Record<string, T[]> = {};
    for (const opt of options) {
      const g = getOptionGroup(opt);
      if (!groups[g]) groups[g] = [];
      groups[g].push(opt);
    }
    return groups;
  }, [options, getOptionGroup]);

  return (
    <section
      className={`selection-section ${isComplete ? 'selection-section--complete' : 'selection-section--pending'}`}
    >
      <h3 className="selection-section__title">{title}</h3>
      {subheading && <p className="selection-section__subheading">{subheading}</p>}

      {variant === 'dropdown' ? (
        <select
          className="selection-section__dropdown grant-picker__select"
          style={{ width: '100%', maxWidth: '400px', display: 'block', margin: '0.5rem 0' }}
          value={selected ? getOptionId(selected) : ''}
          onChange={(e) => {
            const val = e.target.value;
            const opt = options.find((o) => getOptionId(o) === val);
            if (opt) onSelect(opt);
          }}
        >
          <option value="" disabled>Select {title}...</option>
          {groupedOptions
            ? Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
              <optgroup key={groupName} label={groupName.charAt(0).toUpperCase() + groupName.slice(1)}>
                {groupOptions.map((option) => (
                  <option key={getOptionId(option)} value={getOptionId(option)}>
                    {getOptionName(option)}
                  </option>
                ))}
              </optgroup>
            ))
            : options.map((option) => (
              <option key={getOptionId(option)} value={getOptionId(option)}>
                {getOptionName(option)}
              </option>
            ))}
        </select>
      ) : (
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
      )}

      {selected && renderSelectedDetail && (
        <div className="selection-section__detail">{renderSelectedDetail(selected)}</div>
      )}
    </section>
  );
}
