import type { CharacterSelections, Skills } from '../types';
import { deriveHP, deriveMP, LEVEL } from '../derivation';
import { SKILL_KEYS, SKILL_NAMES, HP_LABEL, MP_LABEL } from '../ruleData';
import { getAbilityById } from '../data/abilities';
import { getEquipmentNameById } from '../data/equipment';

interface CharacterSheetProps {
  selections: CharacterSelections;
  skills: Skills;
}

function getPickedItemName(id: string): string {
  const equipName = getEquipmentNameById(id);
  if (equipName) return equipName;
  const ability = getAbilityById(id);
  return ability?.name ?? id;
}

export function CharacterSheet({ selections, skills }: CharacterSheetProps) {
  const hp = deriveHP(skills, selections.bloodline?.id ?? null);
  const mp = deriveMP(skills);

  const fragments = [
    selections.birth,
    selections.youth,
    selections.comingOfAge,
  ].filter(Boolean) as NonNullable<CharacterSelections['birth']>[];

  const pickedItems = fragments.flatMap((f) =>
    f.grants.map((_, i) => {
      const grantKey = `${f.id}-${i}`;
      const pickedId = selections.grantPicks[grantKey];
      return pickedId ? { grant: f.grants[i], source: f.name, name: getPickedItemName(pickedId) } : null;
    }).filter(Boolean)
  ) as { grant: (typeof fragments)[0]['grants'][0]; source: string; name: string }[];

  return (
    <div className="character-sheet">
      <header className="character-sheet__header">
        <h1>Character Sheet</h1>
        <p className="character-sheet__level">Level {LEVEL} Character</p>
      </header>

      <div className="character-sheet__grid">
        <section className="character-sheet__section">
          <h2>Core Traits</h2>
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
          <h2>Derived Stats</h2>
          <dl className="character-sheet__stats">
            <dt>{HP_LABEL}</dt>
            <dd>{hp}</dd>
            <dt>{MP_LABEL}</dt>
            <dd>{mp}</dd>
          </dl>
        </section>

        <section className="character-sheet__section character-sheet__section--full">
          <h2>Skills</h2>
          <div className="character-sheet__skills">
            {SKILL_KEYS.map((key) => (
              <div key={key} className="character-sheet__skill">
                <span className="character-sheet__skill-name">{key} — {SKILL_NAMES[key]}</span>
                <span className="character-sheet__skill-value">{skills[key]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="character-sheet__section character-sheet__section--full">
          <h2>Backstory Grants</h2>
          <ul className="character-sheet__grants">
            {pickedItems.map((item, i) => (
              <li key={i}>
                <span className="character-sheet__grant-source">{item.source}:</span>{' '}
                {item.name}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
