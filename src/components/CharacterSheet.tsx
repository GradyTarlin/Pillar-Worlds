import type { CharacterSelections, Skills, SavedCharacter } from '../types';
import { deriveHP, deriveMP, deriveMPRecovery, deriveEquipment } from '../derivation';
import { SKILL_KEYS, HP_LABEL, MP_LABEL, MP_RECOVERY_LABEL } from '../ruleData';
import { getAbilityById, type Ability } from '../data/abilities';

interface CharacterSheetProps {
  selections: CharacterSelections;
  skills: Skills;
  savedCharacter?: SavedCharacter;
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

export function CharacterSheet({ selections, skills, savedCharacter }: CharacterSheetProps) {
  const level = savedCharacter?.level ?? 1;
  const hp = deriveHP(skills, selections.bloodline?.id ?? null, savedCharacter?.extraHp ?? 0);
  const mp = deriveMP(skills);
  const mpRecovery = deriveMPRecovery(skills);
  const equipment = deriveEquipment(selections, savedCharacter?.leveledGrants ?? []);
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

  const armour = equipment.reduce((sum, item) => sum + (item.grants?.armourMax ?? 0), 0) + armourAbilities;
  const ward = equipment.reduce((sum, item) => sum + (item.grants?.wardMax ?? 0), 0) + wardAbilities;

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
          <h2>Equipment</h2>
          {equipment.length > 0 ? (
            <ul className="character-sheet__equipment" style={{ listStyleType: 'none', paddingLeft: 0 }}>
              {equipment.map((item, i) => (
                <li key={i} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--burgundy)' }}>{item.name}</strong>
                  </div>
                  {item.rulesText && item.rulesText.length > 0 && (
                    <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem', marginBottom: 0, lineHeight: 1.5 }}>
                      {item.rulesText.map((rule, imgIdx) => (
                        <li key={imgIdx} style={{ marginBottom: '0.5rem', whiteSpace: 'pre-wrap' }}>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No equipment.</p>
          )}
        </section>
      </div>
    </div>
  );
}
