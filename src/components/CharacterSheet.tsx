import { useState, useEffect } from 'react';
import type { CharacterSelections, Skills, SavedCharacter, EquipmentCustomization } from '../types';
import { deriveHP, deriveMP, deriveMPRecovery, deriveEquipment, type DerivedEquipmentItem } from '../derivation';
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
  const [editingItem, setEditingItem] = useState<DerivedEquipmentItem | null>(null);
  const [editForm, setEditForm] = useState<EquipmentCustomization>({});

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

  const customs = savedCharacter?.equipmentCustomizations ?? {};

  const armour = equipment.reduce((sum, item) => {
    const cust = customs[item.instanceKey];
    if (cust?.armourMax !== undefined) {
      return sum + cust.armourMax;
    }
    const grants = 'grants' in item ? item.grants : undefined;
    return sum + (grants?.armourMax ?? 0);
  }, 0) + armourAbilities;

  const ward = equipment.reduce((sum, item) => {
    const cust = customs[item.instanceKey];
    if (cust?.wardMax !== undefined) {
      return sum + cust.wardMax;
    }
    const grants = 'grants' in item ? item.grants : undefined;
    return sum + (grants?.wardMax ?? 0);
  }, 0) + wardAbilities;

  const shieldItems = equipment.filter(item => item.type === 'shield');
  const hasShield = shieldItems.length > 0;
  const blockBonusAbilities = allKnownAbilityIds.filter(id => ['shield.bash', 'shield.guardian', 'shield.fortify'].includes(id as string)).length;

  const shieldCustomBlockTotal = shieldItems.reduce((sum, item) => {
    const cust = customs[item.instanceKey];
    return sum + (cust?.blockBonus !== undefined ? cust.blockBonus : 2);
  }, 0);

  const blockBonus = hasShield ? shieldCustomBlockTotal + blockBonusAbilities : 0;

  const handleOpenEdit = (item: DerivedEquipmentItem) => {
    const existing = customs[item.instanceKey] ?? {};
    setEditingItem(item);
    setEditForm({
      attackBonus: existing.attackBonus ?? 0,
      damageBonus: existing.damageBonus ?? 0,
      influenceBonus: existing.influenceBonus ?? 0,
      hideBonus: existing.hideBonus ?? 0,
      magicAttackBonus: existing.magicAttackBonus ?? 0,
      focusBonus: existing.focusBonus ?? 0,
      armourMax: existing.armourMax ?? ('grants' in item ? item.grants?.armourMax ?? 2 : 2),
      wardMax: existing.wardMax ?? ('grants' in item ? item.grants?.wardMax ?? 2 : 2),
      blockBonus: existing.blockBonus ?? 2,
      enchantments: {
        curseOfBloodshed: !!existing.enchantments?.curseOfBloodshed,
        runesOfPower: !!existing.enchantments?.runesOfPower,
        arcaneScript: !!existing.enchantments?.arcaneScript,
        spiritSigil: !!existing.enchantments?.spiritSigil,
      },
    });
  };

  const handleSaveEdit = () => {
    if (!editingItem || !onUpdateCharacter) return;
    const currentCustoms = savedCharacter?.equipmentCustomizations ?? {};
    const updatedCustoms = {
      ...currentCustoms,
      [editingItem.instanceKey]: editForm,
    };
    onUpdateCharacter({ equipmentCustomizations: updatedCustoms });
    setEditingItem(null);
  };

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
            {hasShield && (
              <>
                <dt>Block Bonus</dt>
                <dd>+{blockBonus}</dd>
              </>
            )}
          </dl>
        </section>

        <section className="character-sheet__section character-sheet__section--full">
          <h2>Skills</h2>
          <div className="character-sheet__skills-grid">
            {SKILL_KEYS.map((key) => {
              const val = skills[key];
              return (
                <div key={key} className="character-sheet__skill-box">
                  <span className="character-sheet__skill-name">{key}</span>
                  <span className="character-sheet__skill-val">{val >= 0 ? `+${val}` : val}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="character-sheet__section character-sheet__section--full">
          <h2>Abilities</h2>
          <ul className="character-sheet__abilities" style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {allAbilities.map((item, i) => (
              <li key={i} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--burgundy)' }}>
                    {item.name}
                  </strong>
                  <span style={{ fontSize: '0.85rem', fontStyle: 'italic', opacity: 0.8 }}>
                    {item.source}
                  </span>
                </div>
                <div style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
                  {item.ability.mpCost !== null && item.ability.mpCost !== undefined && (
                    <div style={{ fontStyle: 'italic', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                      Cost: {item.ability.mpCost} MP
                    </div>
                  )}
                  {item.ability.check && (
                    <div style={{ fontStyle: 'italic', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                      Check: {item.ability.check.attackerSkill} vs. {item.ability.check.defenderSkill} ({item.ability.check.range})
                    </div>
                  )}
                  {item.ability.check?.notes && (
                    <div style={{ fontStyle: 'italic', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Note: {item.ability.check.notes}</div>
                  )}

                  <div style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{item.ability.rulesText}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="character-sheet__section character-sheet__section--full">
          <h2>Equipment &amp; Inventory</h2>
          {equipment.length > 0 ? (
            <ul className="character-sheet__equipment" style={{ listStyleType: 'none', paddingLeft: 0 }}>
              {equipment.map((item) => {
                const cust = customs[item.instanceKey] ?? {};
                return (
                  <li key={item.instanceKey} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--burgundy)' }}>
                          {item.name}
                        </strong>
                        <span style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'capitalize' }}>
                          ({item.type}{item.subtype ? ` - ${item.subtype}` : ''})
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {onUpdateCharacter && (
                          <button
                            type="button"
                            style={{
                              padding: '0.2rem 0.6rem',
                              fontSize: '0.8rem',
                              margin: 0,
                              backgroundColor: 'rgba(255, 255, 255, 0.15)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              color: 'var(--ink)',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleOpenEdit(item)}
                          >
                            ⚙️ Edit Stats
                          </button>
                        )}
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
                    </div>

                    {/* Finalized Stats Display */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.4rem 0' }}>
                      {item.type === 'weapon' && (
                        <>
                          {cust.attackBonus !== undefined && cust.attackBonus !== 0 && (
                            <span style={{ background: 'rgba(180, 50, 50, 0.2)', border: '1px solid rgba(180, 50, 50, 0.4)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                              Attack Bonus: +{cust.attackBonus}
                            </span>
                          )}
                          {cust.damageBonus !== undefined && cust.damageBonus !== 0 && (
                            <span style={{ background: 'rgba(180, 50, 50, 0.2)', border: '1px solid rgba(180, 50, 50, 0.4)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                              Damage Bonus: +{cust.damageBonus}
                            </span>
                          )}
                        </>
                      )}
                      {item.type === 'trick' && (
                        <>
                          {cust.influenceBonus !== undefined && cust.influenceBonus !== 0 && (
                            <span style={{ background: 'rgba(50, 150, 180, 0.2)', border: '1px solid rgba(50, 150, 180, 0.4)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                              Influence Bonus: +{cust.influenceBonus}
                            </span>
                          )}
                          {cust.hideBonus !== undefined && cust.hideBonus !== 0 && (
                            <span style={{ background: 'rgba(50, 150, 180, 0.2)', border: '1px solid rgba(50, 150, 180, 0.4)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                              Hide Bonus: +{cust.hideBonus}
                            </span>
                          )}
                        </>
                      )}
                      {item.type === 'relic' && (
                        <>
                          {cust.magicAttackBonus !== undefined && cust.magicAttackBonus !== 0 && (
                            <span style={{ background: 'rgba(140, 50, 180, 0.2)', border: '1px solid rgba(140, 50, 180, 0.4)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                              Magic Attack Bonus: +{cust.magicAttackBonus}
                            </span>
                          )}
                          {cust.focusBonus !== undefined && cust.focusBonus !== 0 && (
                            <span style={{ background: 'rgba(140, 50, 180, 0.2)', border: '1px solid rgba(140, 50, 180, 0.4)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                              Focus Bonus: +{cust.focusBonus}
                            </span>
                          )}
                        </>
                      )}
                      {item.type === 'armour' && cust.armourMax !== undefined && (
                        <span style={{ background: 'rgba(50, 180, 80, 0.2)', border: '1px solid rgba(50, 180, 80, 0.4)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                          Armour: {cust.armourMax}
                        </span>
                      )}
                      {item.type === 'ward' && cust.wardMax !== undefined && (
                        <span style={{ background: 'rgba(50, 180, 80, 0.2)', border: '1px solid rgba(50, 180, 80, 0.4)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                          Ward: {cust.wardMax}
                        </span>
                      )}
                      {item.type === 'shield' && (
                        <span style={{ background: 'rgba(50, 180, 80, 0.2)', border: '1px solid rgba(50, 180, 80, 0.4)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                          Block Bonus: +{cust.blockBonus !== undefined ? cust.blockBonus : 2}
                        </span>
                      )}
                    </div>

                    {/* Finalized Weapon Enchantment Notes */}
                    {item.type === 'weapon' && cust.enchantments && (
                      <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                        {cust.enchantments.curseOfBloodshed && (
                          <div style={{ background: 'rgba(217, 4, 41, 0.1)', borderLeft: '3px solid #d90429', padding: '0.3rem 0.5rem', borderRadius: '0 4px 4px 0' }}>
                            🩸 <strong>Curse of Bloodshed:</strong> Wielder can spend 2 HP to deal +3 physical damage when they hit an attack with it.
                          </div>
                        )}
                        {cust.enchantments.runesOfPower && (
                          <div style={{ background: 'rgba(240, 160, 0, 0.1)', borderLeft: '3px solid #f0a000', padding: '0.3rem 0.5rem', borderRadius: '0 4px 4px 0' }}>
                            ⚡ <strong>Runes of Power:</strong> Once per turn, infuse weapon. Spend 1 MP on damage to gain 1 point of focus.
                          </div>
                        )}
                        {cust.enchantments.spiritSigil && (
                          <div style={{ background: 'rgba(0, 160, 240, 0.1)', borderLeft: '3px solid #00a0f0', padding: '0.3rem 0.5rem', borderRadius: '0 4px 4px 0' }}>
                            🔮 <strong>Spirit Sigil:</strong> Bound spirit weapon. Summon from any distance; deals bonus magic damage equal to focus on hit.
                          </div>
                        )}
                        {cust.enchantments.arcaneScript && (
                          <div style={{ background: 'rgba(160, 0, 240, 0.1)', borderLeft: '3px solid #a000f0', padding: '0.3rem 0.5rem', borderRadius: '0 4px 4px 0' }}>
                            📜 <strong>Arcane Script:</strong> Spend 2 MP while focusing to let weapon hover &amp; make 1 free PRW attack/turn.
                          </div>
                        )}
                      </div>
                    )}

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
                );
              })}
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

      {/* Separate Modal Editing Panel */}
      {editingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--parchment)',
            color: 'var(--ink)',
            padding: '1.5rem',
            borderRadius: '8px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--ink)', paddingBottom: '0.5rem', fontFamily: '"Cinzel", serif' }}>
              Edit Stats: {editingItem.name}
            </h3>

            {editingItem.type === 'weapon' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Attack Bonus (+X):</label>
                  <input
                    type="number"
                    value={editForm.attackBonus ?? 0}
                    onChange={(e) => setEditForm({ ...editForm, attackBonus: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--ink)', background: '#fff', color: '#000' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Damage Bonus (+X):</label>
                  <input
                    type="number"
                    value={editForm.damageBonus ?? 0}
                    onChange={(e) => setEditForm({ ...editForm, damageBonus: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--ink)', background: '#fff', color: '#000' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Weapon Curses &amp; Enchantments:</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="checkbox"
                        checked={!!editForm.enchantments?.curseOfBloodshed}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          enchantments: { ...editForm.enchantments, curseOfBloodshed: e.target.checked }
                        })}
                        style={{ marginTop: '0.2rem' }}
                      />
                      <span><strong>Curse of Bloodshed</strong> (Wielder can spend 2 HP to deal +3 physical damage on hit)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="checkbox"
                        checked={!!editForm.enchantments?.runesOfPower}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          enchantments: { ...editForm.enchantments, runesOfPower: e.target.checked }
                        })}
                        style={{ marginTop: '0.2rem' }}
                      />
                      <span><strong>Runes of Power</strong> (Spend 1 MP on damage to gain 1 point of focus)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="checkbox"
                        checked={!!editForm.enchantments?.spiritSigil}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          enchantments: { ...editForm.enchantments, spiritSigil: e.target.checked }
                        })}
                        style={{ marginTop: '0.2rem' }}
                      />
                      <span><strong>Spirit Sigil</strong> (Bound spirit weapon; bonus magic damage equal to focus on hit)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="checkbox"
                        checked={!!editForm.enchantments?.arcaneScript}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          enchantments: { ...editForm.enchantments, arcaneScript: e.target.checked }
                        })}
                        style={{ marginTop: '0.2rem' }}
                      />
                      <span><strong>Arcane Script</strong> (Spend 2 MP while focusing to hover &amp; make 1 free PRW attack/turn)</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {editingItem.type === 'trick' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Influence Bonus (+X):</label>
                  <input
                    type="number"
                    value={editForm.influenceBonus ?? 0}
                    onChange={(e) => setEditForm({ ...editForm, influenceBonus: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--ink)', background: '#fff', color: '#000' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Hide Bonus (+X):</label>
                  <input
                    type="number"
                    value={editForm.hideBonus ?? 0}
                    onChange={(e) => setEditForm({ ...editForm, hideBonus: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--ink)', background: '#fff', color: '#000' }}
                  />
                </div>
              </>
            )}

            {editingItem.type === 'relic' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Magic Attack Bonus (+X):</label>
                  <input
                    type="number"
                    value={editForm.magicAttackBonus ?? 0}
                    onChange={(e) => setEditForm({ ...editForm, magicAttackBonus: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--ink)', background: '#fff', color: '#000' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Focus Bonus (+X):</label>
                  <input
                    type="number"
                    value={editForm.focusBonus ?? 0}
                    onChange={(e) => setEditForm({ ...editForm, focusBonus: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--ink)', background: '#fff', color: '#000' }}
                  />
                </div>
              </>
            )}

            {editingItem.type === 'armour' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Armour Rating:</label>
                <input
                  type="number"
                  value={editForm.armourMax ?? 2}
                  onChange={(e) => setEditForm({ ...editForm, armourMax: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--ink)', background: '#fff', color: '#000' }}
                />
              </div>
            )}

            {editingItem.type === 'ward' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Ward Rating:</label>
                <input
                  type="number"
                  value={editForm.wardMax ?? 2}
                  onChange={(e) => setEditForm({ ...editForm, wardMax: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--ink)', background: '#fff', color: '#000' }}
                />
              </div>
            )}

            {editingItem.type === 'shield' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Block Bonus (+X):</label>
                <input
                  type="number"
                  value={editForm.blockBonus ?? 2}
                  onChange={(e) => setEditForm({ ...editForm, blockBonus: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--ink)', background: '#fff', color: '#000' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="app__back-button"
                style={{ margin: 0, padding: '0.5rem 1rem' }}
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="app__finish-button"
                style={{ margin: 0, padding: '0.5rem 1.25rem' }}
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
