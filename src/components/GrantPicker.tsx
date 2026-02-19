import type { Grant } from '../types';
import { getAbilitiesByTagForLevel, getAbilitiesByTagsForLevel } from '../data/abilities';
import { getBaseItemsForEquipmentPick } from '../data/equipment';
import { LEVEL } from '../derivation';

interface GrantPickerProps {
  grant: Grant;
  grantKey: string;
  value: string;
  onChange: (grantKey: string, itemId: string) => void;
}

export function GrantPicker({ grant, grantKey, value, onChange }: GrantPickerProps) {
  let options: { id: string; name: string }[] = [];

  switch (grant.kind) {
    case 'equipmentPick':
      options = getBaseItemsForEquipmentPick();
      break;
    case 'masteryPick':
      options = (grant.tags ? getAbilitiesByTagsForLevel(grant.tags, LEVEL) : []).map((a) => ({
        id: a.id,
        name: a.name,
      }));
      break;
    case 'abilityPick':
      options = (grant.tags?.[0] ? getAbilitiesByTagForLevel(grant.tags[0], LEVEL) : []).map((a) => ({
        id: a.id,
        name: a.name,
      }));
      break;
    default:
      return null;
  }

  if (options.length === 0) return null;

  const label =
    grant.kind === 'equipmentPick'
      ? 'Choose equipment'
      : grant.kind === 'masteryPick'
        ? `Choose ${grant.tags?.join(' or ')} mastery`
        : grant.kind === 'abilityPick'
          ? `Choose ${grant.tags?.[0]} ability`
          : 'Choose';

  return (
    <div className="grant-picker">
      <label htmlFor={grantKey} className="grant-picker__label">
        {label}
      </label>
      <select
        id={grantKey}
        className="grant-picker__select"
        value={value}
        onChange={(e) => onChange(grantKey, e.target.value)}
      >
        <option value="">— Select —</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}
