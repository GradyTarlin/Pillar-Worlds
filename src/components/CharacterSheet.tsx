import { useState, useEffect } from 'react';
import type { CharacterSelections, Skills, SavedCharacter } from '../types';
import { deriveHP, deriveMP, deriveMPRecovery, deriveEquipment } from '../derivation';
import { SKILL_KEYS, HP_LABEL, MP_LABEL, MP_RECOVERY_LABEL } from '../ruleData';
import { getAbilityById, type Ability } from '../data/abilities';
import { baseItems, artifacts } from '../data/equipment';

interface CharacterSheetProps {
  selections: CharacterSelections;
  skills: Skills;
  savedCharacter?: SavedCharacter;
  onUpdateCharacter?: (updates: Partial<SavedCharacter>) => void;
}

interface PickedAbilityDetail {
  source: string;
  name: string;
  ability: Ability;
}

function getPickedItemDetail(id: string, source: string): PickedAbilityDetail | null {
  const ability = getAbilityById(id);
  if (ability) {
    return { source, name: ability.name, ability: ability };
  }

  return null;
}

export function CharacterSheet({ selections, skills, savedCharacter, onUpdateCharacter }: CharacterSheetProps) {
  const [notesText, setNotesText] = useState(savedCharacter?.notes ?? '');
  const [selectedEquipId, setSelectedEquipId] = useState('');

  useEffect(() => {
    setNotesText(savedCharacter?.notes ?? '');
  }, [savedCharacter?.notes]);

  const level = savedCharacter?.level ?? 1;
  const hp = deriveHP(skills, selections.bloodline?.id ?? null, savedCharacter?.extraHp ?? 0);
  const mp = deriveMP(skills);
  const mpRecovery = deriveMPRecovery(skills);
  const equipment = deriveEquipment(
    { ...selections, inventory: savedCharacter?.inventory },
    savedCharacter?.leveledGrants ?? []
  );
  const fragments = [
    selections.birth,
    selections.youth,
    selections.comingOfAge,
  ].filter(Boolean) as NonNullable<CharacterSelections['birth']>[];

  const pickedAbilities = fragments.flatMap((f) =>
    f.grants.map((_, i) => {
      const grantKey = `${f.id}-${i}`;
      const pickedId = selections.grantPicks[grantKey];
      return pickedId ? getPickedItemDetail(pickedId, f.name) : null;
    }).filter(Boolean)
  ) as PickedAbilityDetail[];

  const leveledAbilities = (savedCharacter?.leveledGrants ?? [])
    .map(id => getPickedItemDetail(id, 'Level Up'))
    .filter(Boolean) as PickedAbilityDetail[];

  const allAbilities = [...pickedAbilities, ...leveledAbilities];

  const allKnownAbilityIds = allAbilities.map(a => a.ability.id);

  const armourAbilities = allKnownAbilityIds.filter(id => ['armour.bulwark', 'armour.impenetrable', 'armour.juggernaut'].includes(id as string)).length;
  const wardAbilities = allKnownAbilityIds.filter(id => ['ward.phase_shift', 'ward.mana_reflection', 'ward.arcane_battery'].includes(id as string)).length;

  const armour = equipment.reduce((sum, item) => {
    const grants = 'grants' in item ? item.grants : undefined;
    return sum + (grants?.armourMax ?? 0);
  }, 0) + armourAbilities;

  const ward = equipment.reduce((sum, item) => {
    const grants = 'grants' in item ? item.grants : undefined;
    return sum + (grants?.wardMax ?? 0);
  }, 0) + wardAbilities;

  return (
    <div className="character-sheet">
      <header className="character-sheet__header">
        <h1>{selections.name}</h1>
        <p className="character-sheet__level">Level {level} Character</p>
      </header>

      <div className="character-sheet__grid">
        <section className="character-sheet__section">
          <h2>Attributes</h2>
          <dl className="character-sheet__traits">
            <dt>Body</dt>
            <dd>{selections.body?.name ?? '—'}</dd>
            <dt>Mind</dt>
            <dd>{selections.mind?.name ?? '—'}</dd>
            <dt>Spirit</dt>
            <dd>{selections.spirit?.name ?? '—'}</dd>
            <dt>Zodiac</dt>
            <dd>{selections.zodiac?.name ?? '—'}</dd>
          </dl>
        </section>

        <section className="character-sheet__section">
          <h2>Bloodline</h2>
          <p className="character-sheet__bloodline-name">{selections.bloodline?.name ?? '—'}</p>
          {selections.bloodline && (
            <div className="character-sheet__bloodline-feature">
              <strong>{selections.bloodline.featureName}:</strong> {selections.bloodline.featureText}
            </div>
          )}
        </section>

        <section className="character-sheet__section">
          <h2>Backstory</h2>
          <dl className="character-sheet__traits">
            <dt>Birth</dt>
            <dd>{selections.birth?.name ?? '—'}</dd>
            <dt>Youth</dt>
            <dd>{selections.youth?.name ?? '—'}</dd>
            <dt>Coming of Age</dt>
            <dd>{selections.comingOfAge?.name ?? '—'}</dd>
          </dl>
        </section>

        <section className="character-sheet__section">
          <h2>Health and Mana</h2>
          <dl className="character-sheet__stats">
            <dt>{HP_LABEL}</dt>
            <dd>{hp}</dd>
            <dt>{MP_LABEL}</dt>
            <dd>{mp}</dd>
            <dt>{MP_RECOVERY_LABEL}</dt>
            <dd>{mpRecovery}</dd>
            {armour > 0 && (
              <>
                <dt>Armour</dt>
                <dd>{armour}</dd>
              </>
            )}
            {ward > 0 && (
              <>
                <dt>Ward</dt>
                <dd>{ward}</dd>
              </>
            )}
          </dl>
        </section>

        <section className="character-sheet__section character-sheet__section--full">
          <h2>Skills</h2>
          <div className="character-sheet__skills">
            {SKILL_KEYS.map((key) => (
              <div key={key} className="character-sheet__skill">
                <span className="character-sheet__skill-name">{key}</span>
                <span className="character-sheet__skill-value">{skills[key]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="character-sheet__section character-sheet__section--full">
          <h2>Abilities</h2>
          <ul className="character-sheet__grants" style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {allAbilities.map((item, i) => (
              <li key={i} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ marginBottom: '0.25rem' }}>
                  <span className="character-sheet__grant-source" style={{ fontWeight: 'bold' }}>{item.source}:</span>{' '}
                  <strong style={{ fontSize: '1.1rem', color: 'var(--burgundy)' }}>{item.name}</strong>
                  {item.ability.mpCost && <span style={{ marginLeft: '0.5rem', color: 'var(--forest)' }}>({item.ability.mpCost} MP)</span>}
                </div>
                <div style={{ paddingLeft: '1rem', borderLeft: '2px solid rgba(255,255,255,0.2)' }}>
                  {item.ability.trigger && (
                    <div style={{ fontStyle: 'italic', marginBottom: '0.25rem' }}>Trigger: {item.ability.trigger}</div>
                  )}
                  {item.ability.requiresAttention && (
                    <div style={{ color: 'var(--attention-color, #ffb703)', marginBottom: '0.25rem' }}>Requires Attention</div>
                  )}

                  {/* Render the skill check details if they exist */}
                  {item.ability.check && (
                    <div style={{ marginBottom: '0.25rem', fontWeight: 'bold' }}>
                      {item.ability.check.attackerSkill}
                      {item.ability.check.defenderSkill ? ` vs. ${item.ability.check.defenderSkill}` : ''}
                      {item.ability.check.range || item.ability.check.area ? ` (` : ''}
                      {item.ability.check.range && `range: ${item.ability.check.range}`}
                      {item.ability.check.range && item.ability.check.area ? `, ` : ''}
                      {item.ability.check.area && `area: ${item.ability.check.area}`}
                      {item.ability.check.range || item.ability.check.area ? `)` : ''}
                    </div>
                  )}
                  {item.ability.check?.notes && (
                    <div style={{ fontStyle: 'italic', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Note: {item.ability.check.notes}</div>
                  )}

                  <div style={{ lineHeight: 1.5 }}>{item.ability.rulesText}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="character-sheet__section character-sheet__section--full">
          <h2>Equipment &amp; Inventory</h2>
          {equipment.length > 0 ? (
            <ul className="character-sheet__equipment" style={{ listStyleType: 'none', paddingLeft: 0 }}>
              {equipment.map((item, i) => (
                <li key={i} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--burgundy)' }}>
                      {item.name}
                    </strong>
                    {onUpdateCharacter && savedCharacter?.inventory?.includes(item.id) && (
                      <button
                        type="button"
                        className="app__back-button"
                        style={{
                          padding: '0.2rem 0.6rem',
                          fontSize: '0.8rem',
                          margin: 0,
                          backgroundColor: '#d90429',
                          border: 'none',
                          color: '#fff',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          const currentInventory = savedCharacter.inventory ?? [];
                          const idx = currentInventory.indexOf(item.id);
                          if (idx > -1) {
                            const newInventory = [...currentInventory];
                            newInventory.splice(idx, 1);
                            onUpdateCharacter({ inventory: newInventory });
                          }
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {item.rulesText && (
                    <div style={{ paddingLeft: '1.25rem', marginTop: '0.25rem', lineHeight: 1.5 }}>
                      {Array.isArray(item.rulesText) ? (
                        <ul style={{ paddingLeft: 0, margin: 0, listStyleType: 'disc' }}>
                          {item.rulesText.map((rule, imgIdx) => (
                            <li key={imgIdx} style={{ marginBottom: '0.5rem', whiteSpace: 'pre-wrap' }}>
                              {rule}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{item.rulesText}</div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No equipment.</p>
          )}

          {onUpdateCharacter && savedCharacter && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px'
            }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', fontFamily: '"Cinzel", serif' }}>Add Equipment or Artifact</h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <select
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '0.5rem',
                    background: 'var(--parchment)',
                    color: 'var(--ink)',
                    border: '1px solid var(--ink)',
                    borderRadius: '4px',
                    fontSize: '0.95rem'
                  }}
                  value={selectedEquipId}
                  onChange={(e) => setSelectedEquipId(e.target.value)}
                >
                  <option value="">-- Choose Equipment / Artifact --</option>
                  <optgroup label="Standard Equipment">
                    {baseItems.map(item => (
                      <option key={item.id} value={item.id}>{item.name} ({item.type})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Artifacts">
                    {artifacts.map(item => (
                      <option key={item.id} value={item.id}>{item.name} (Artifact, {item.type})</option>
                    ))}
                  </optgroup>
                </select>
                <button
                  type="button"
                  className="app__finish-button"
                  style={{ margin: 0, padding: '0.5rem 1.25rem' }}
                  onClick={() => {
                    if (selectedEquipId) {
                      const currentInventory = savedCharacter.inventory ?? [];
                      onUpdateCharacter({ inventory: [...currentInventory, selectedEquipId] });
                      setSelectedEquipId('');
                    }
                  }}
                  disabled={!selectedEquipId}
                >
                  Add to Inventory
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="character-sheet__section character-sheet__section--full">
          <h2>Notes</h2>
          {onUpdateCharacter ? (
            <textarea
              className="character-sheet__notes-input"
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              onBlur={() => {
                if (onUpdateCharacter) {
                  onUpdateCharacter({ notes: notesText });
                }
              }}
              placeholder="Record your character's deeds, factions, or reminders here..."
              style={{
                width: '100%',
                minHeight: '150px',
                background: 'var(--parchment)',
                color: 'var(--ink)',
                border: '1px solid var(--ink)',
                borderRadius: '4px',
                padding: '0.75rem',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
                lineHeight: '1.5'
              }}
            />
          ) : (
            <div style={{
              whiteSpace: 'pre-wrap',
              background: 'rgba(0, 0, 0, 0.05)',
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
              lineHeight: '1.5'
            }}>
              {savedCharacter?.notes || <span style={{ fontStyle: 'italic', color: 'var(--ink-muted)' }}>No notes compiled yet. Use the character view to edit notes.</span>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
