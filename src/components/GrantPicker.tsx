import type { Grant } from '../types';
import { getAbilitiesByTagForLevel, getAbilitiesByTagsForLevel, getAbilityById } from '../data/abilities';
import { getBaseItemsForEquipmentPick } from '../data/equipment';
import { LEVEL } from '../derivation';

interface GrantPickerProps {
  grant: Grant;
  grantKey: string;
  value: string;
  onChange: (grantKey: string, itemId: string) => void;
  allPicks?: Record<string, string>;
}

export function GrantPicker({ grant, grantKey, value, onChange, allPicks = {} }: GrantPickerProps) {
  let options: { id: string; name: string; tag?: string }[] = [];

  switch (grant.kind) {
    case 'equipmentPick':
      options = getBaseItemsForEquipmentPick();
      break;
    case 'masteryPick':
      options = (grant.tags ? getAbilitiesByTagsForLevel(grant.tags, LEVEL) : []).map((a) => ({
        id: a.id,
        name: a.name,
        tag: a.tag,
      }));
      break;
    case 'abilityPick':
      options = (grant.tags?.[0] ? getAbilitiesByTagForLevel(grant.tags[0], LEVEL) : []).map((a) => ({
        id: a.id,
        name: a.name,
        tag: a.tag,
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

  // For mastery and equipment picks, group by tag
  const isGrouped = grant.kind === 'masteryPick' || grant.kind === 'equipmentPick';
  const groupedOptions = isGrouped
    ? options.reduce((acc, opt) => {
      const tag = opt.tag || 'other';
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(opt);
      return acc;
    }, {} as Record<string, typeof options>)
    : { all: options };

  // Fetch full details of the chosen ability
  const selectedAbility = value && (grant.kind === 'abilityPick' || grant.kind === 'masteryPick')
    ? getAbilityById(value)
    : null;

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
        {isGrouped ? (
          Object.entries(groupedOptions).map(([tag, opts]) => (
            <optgroup key={tag} label={tag.charAt(0).toUpperCase() + tag.slice(1)}>
              {opts.map((opt) => {
                const isSelectedElsewhere = grant.kind !== 'equipmentPick' && Object.entries(allPicks).some(([k, v]) => k !== grantKey && v === opt.id);
                return (
                  <option key={opt.id} value={opt.id} disabled={isSelectedElsewhere}>
                    {opt.name} {isSelectedElsewhere ? '(Already Chosen)' : ''}
                  </option>
                );
              })}
            </optgroup>
          ))
        ) : (
          options.map((opt) => {
            const isSelectedElsewhere = grant.kind !== 'equipmentPick' && Object.entries(allPicks).some(([k, v]) => k !== grantKey && v === opt.id);
            return (
              <option key={opt.id} value={opt.id} disabled={isSelectedElsewhere}>
                {opt.name} {isSelectedElsewhere ? '(Already Chosen)' : ''}
              </option>
            );
          })
        )}
      </select>

      {selectedAbility && (
        <div className="grant-picker__preview" style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px', fontSize: '0.9rem' }}>
          <strong>{selectedAbility.name}</strong>
          {selectedAbility.mpCost && <span style={{ marginLeft: '0.5rem', color: 'var(--mp-color, #48cae4)' }}>({selectedAbility.mpCost} MP)</span>}
          {selectedAbility.trigger && <div style={{ fontStyle: 'italic', marginTop: '0.25rem' }}>Trigger: {selectedAbility.trigger}</div>}
          {selectedAbility.requiresAttention && <div style={{ color: 'var(--attention-color, #ffb703)', marginTop: '0.25rem' }}>Requires Attention</div>}

          {/* Render the skill check details if they exist */}
          {selectedAbility.check && (
            <div style={{ marginTop: '0.25rem', fontWeight: 'bold' }}>
              {selectedAbility.check.attackerSkill}
              {selectedAbility.check.defenderSkill ? ` vs. ${selectedAbility.check.defenderSkill}` : ''}
              {selectedAbility.check.range || selectedAbility.check.area ? ` (` : ''}
              {selectedAbility.check.range && `range: ${selectedAbility.check.range}`}
              {selectedAbility.check.range && selectedAbility.check.area ? `, ` : ''}
              {selectedAbility.check.area && `area: ${selectedAbility.check.area}`}
              {selectedAbility.check.range || selectedAbility.check.area ? `)` : ''}
            </div>
          )}
          {selectedAbility.check?.notes && (
            <div style={{ fontStyle: 'italic', marginTop: '0.25rem', fontSize: '0.85rem' }}>Note: {selectedAbility.check.notes}</div>
          )}

          <div style={{ marginTop: '0.5rem' }}>{selectedAbility.rulesText}</div>
        </div>
      )}
    </div>
  );
}
