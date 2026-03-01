import { Fragment, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { CharacterSelections, Bloodline, SkillKey, Grant } from '../types';
import {
  BODY_OPTIONS,
  SPIRIT_OPTIONS,
  MIND_OPTIONS,
  ZODIAC_OPTIONS,
  BLOODLINES,
  BIRTH_FRAGMENTS,
  YOUTH_FRAGMENTS,
  COMING_OF_AGE_FRAGMENTS,
  SKILL_KEYS,
  SKILL_NAMES,
  HP_LABEL,
  MP_LABEL,
  MP_RECOVERY_LABEL,
} from '../ruleData';
import { deriveSkills, deriveHP, deriveMP, deriveMPRecovery } from '../derivation';
import { useCharacters } from '../hooks/useCharacters';
import { baseItems } from '../data/equipment';
import { useNavigate } from 'react-router-dom';
import { AttributeSlider } from '../components/AttributeSlider';
import { SelectionSection } from '../components/SelectionSection';
import { GrantPicker } from '../components/GrantPicker';
import '../App.css';

const INITIAL_SELECTIONS: CharacterSelections = {
  name: '',
  body: null,
  mind: null,
  spirit: null,
  zodiac: null,
  bloodline: null,
  humanExtraSkill: null,
  birth: null,
  youth: null,
  comingOfAge: null,
  grantPicks: {},
  startingEquipment: null,
};

export function CharacterCreationPage() {
  const [selections, setSelections] = useState<CharacterSelections>(INITIAL_SELECTIONS);
  const { createCharacter } = useCharacters();
  const navigate = useNavigate();

  const skills = useMemo(() => deriveSkills(selections), [selections]);

  const backstoryFragments = [selections.birth, selections.youth, selections.comingOfAge].filter(
    Boolean
  ) as NonNullable<CharacterSelections['birth']>[];
  const allGrantPicksComplete = backstoryFragments.every((f) =>
    f.grants.every((_, i) => selections.grantPicks[`${f.id}-${i}`])
  );

  const isComplete =
    selections.name.trim() !== '' &&
    selections.body &&
    selections.mind &&
    selections.spirit &&
    selections.zodiac &&
    selections.bloodline &&
    (selections.bloodline.id === 'bloodline.human' ? !!selections.humanExtraSkill : true) &&
    selections.birth &&
    selections.youth &&
    selections.comingOfAge &&
    allGrantPicksComplete &&
    selections.startingEquipment !== null;

  const updateSelection = <K extends keyof CharacterSelections>(
    key: K,
    value: CharacterSelections[K]
  ) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
  };

  const handleGrantPick = (grantKey: string, itemId: string) => {
    setSelections((prev) => ({
      ...prev,
      grantPicks: { ...prev.grantPicks, [grantKey]: itemId },
    }));
  };

  const handleFinish = () => {
    if (isComplete) {
      const newId = createCharacter(selections);
      navigate(`/character/${newId}`);
    }
  };

  const renderAttributeDetail = (attribute: { bonuses: Record<string, number> }) => {
    const parts = Object.entries(attribute.bonuses).map(
      ([key, val]) => `${SKILL_NAMES[key as keyof typeof SKILL_NAMES]} +${val}`
    );
    return (
      <div className="body-detail">
        <strong>Skill bonuses:</strong> {parts.join(', ')}
      </div>
    );
  };

  const renderBackstoryDetail = (fragment: { id: string, flavourText?: string, grants: Grant[] }) => (
    <div className="backstory-detail">
      {fragment.flavourText && (
        <p className="backstory-detail__flavour">{fragment.flavourText}</p>
      )}
      <div className="backstory-detail__grants">
        {fragment.grants.map((grant, i) => {
          const grantKey = `${fragment.id}-${i}`;
          return (
            <GrantPicker
              key={grantKey}
              grant={grant}
              grantKey={grantKey}
              value={selections.grantPicks[grantKey] ?? ''}
              onChange={handleGrantPick}
              allPicks={selections.grantPicks}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="app">
      <header className="app__header" style={{ textAlign: 'center' }}>
        <div className="app__header-top" style={{ justifyContent: 'center', position: 'relative' }}>
          <Link to="/" className="app__home-link" style={{ position: 'absolute', left: 0 }}>← Home</Link>
          <h1>Character Creation</h1>
        </div>
        <p className="app__subtitle" style={{ fontSize: '1.2rem', color: 'var(--ink-muted)', marginTop: '0.25rem', marginBottom: '0.5rem', fontStyle: 'italic' }}>Forge your next hero</p>
      </header>

      <div className="app__content">
        <main className="app__main">
          <div className="app__name-input-group" style={{ marginBottom: '2rem', background: 'var(--parchment)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--ink)' }}>
            <label htmlFor="character-name" className="app__name-label" style={{ fontWeight: 'bold' }}>Character Name: </label>
            <input
              type="text"
              id="character-name"
              className="app__name-input"
              value={selections.name}
              onChange={(e) => updateSelection('name', e.target.value)}
              placeholder="Enter character name..."
              style={{ padding: '0.5rem', flex: 1, minWidth: '300px', marginLeft: '1rem' }}
            />
          </div>

          <div className="attributes-group">
            <h3 className="attributes-group__title">Attributes</h3>
            <div className="attributes-group__content">
              <AttributeSlider
                title="Body"
                subheading="Your physical build — affects Strength and Prowess."
                options={BODY_OPTIONS}
                selected={selections.body}
                onSelect={(opt) => updateSelection('body', opt)}
                getOptionName={(o) => o.name}
                renderSelectedDetail={renderAttributeDetail}
              />
              <AttributeSlider
                title="Mind"
                subheading="Your mental approach — affects Wisdom and Instinct."
                options={MIND_OPTIONS}
                selected={selections.mind}
                onSelect={(opt) => updateSelection('mind', opt)}
                getOptionName={(o) => o.name}
                renderSelectedDetail={renderAttributeDetail}
              />
              <AttributeSlider
                title="Spirit"
                subheading="Your social disposition — affects Stealth and Charisma."
                options={SPIRIT_OPTIONS}
                selected={selections.spirit}
                onSelect={(opt) => updateSelection('spirit', opt)}
                getOptionName={(o) => o.name}
                renderSelectedDetail={renderAttributeDetail}
              />
            </div>
          </div>
          <SelectionSection
            title="Zodiac"
            subheading="Your astrological sign — grants a bonus to one skill."
            options={ZODIAC_OPTIONS}
            selected={selections.zodiac}
            onSelect={(opt) => updateSelection('zodiac', opt)}
            getOptionId={(o) => o.id}
            getOptionName={(o) => {
              const skillKey = Object.keys(o.bonuses)[0] as keyof typeof SKILL_NAMES;
              return `${o.name} (+1 ${SKILL_NAMES[skillKey]})`;
            }}
            variant="dropdown"
            ghostUnselectedWhenSelected
            isComplete={!!selections.zodiac}
          />
          <SelectionSection<Bloodline>
            title="Bloodline"
            subheading="Your ancestry — each grants a unique racial feature."
            options={BLOODLINES}
            selected={selections.bloodline}
            onSelect={(opt) => updateSelection('bloodline', opt)}
            getOptionId={(o) => o.id}
            getOptionName={(o) => o.name}
            variant="dropdown"
            getOptionGroup={(o) => o.type}
            renderSelectedDetail={(bloodline) => (
              <div className="bloodline-detail">
                <strong>{bloodline.featureName}:</strong> {bloodline.featureText}
                {bloodline.id === 'bloodline.human' && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <label htmlFor="human-extra-skill" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                      Select Extra Skill:
                    </label>
                    <select
                      id="human-extra-skill"
                      className="grant-picker__select"
                      style={{ width: '100%', maxWidth: '200px' }}
                      value={selections.humanExtraSkill ?? ''}
                      onChange={(e) => updateSelection('humanExtraSkill', e.target.value as SkillKey)}
                    >
                      <option value="" disabled>Select skill...</option>
                      {SKILL_KEYS.map((sk) => (
                        <option key={sk} value={sk}>{sk} — {SKILL_NAMES[sk]}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
            ghostUnselectedWhenSelected
            isComplete={!!selections.bloodline && (selections.bloodline.id === 'bloodline.human' ? !!selections.humanExtraSkill : true)}
          />
          <SelectionSection
            title="Starting Equipment"
            subheading="Choose one piece of standard equipment to begin your journey with."
            options={baseItems}
            selected={baseItems.find(i => i.id === selections.startingEquipment) ?? null}
            onSelect={(opt) => updateSelection('startingEquipment', opt.id)}
            getOptionId={(o) => o.id}
            getOptionName={(o) => o.name}
            variant="dropdown"
            getOptionGroup={(o) => {
              if (o.type === 'weapon') return 'Weapon';
              if (o.type === 'relic') return 'Relic';
              if (o.type === 'trick') return 'Trick';
              return 'Defence';
            }}
            ghostUnselectedWhenSelected
            isComplete={!!selections.startingEquipment}
          />
          <div className="backstory-group">
            <h3 className="backstory-group__title">Backstory</h3>
            <p className="backstory-group__intro">
              Even at the beginning of their true adventure, your character has already been through
              experiences that have shaped their life. Your character&apos;s backstory is made up of their <strong>birth</strong>,
              <strong>youth</strong>, and <strong>coming of age</strong>. Choose one story fragment for each of these stages of life. Story
              fragments may grant equipment or abilities.
            </p>
            <SelectionSection
              title="Birth"
              subheading="The circumstances of your birth — shapes your starting gifts."
              options={BIRTH_FRAGMENTS}
              selected={selections.birth}
              onSelect={(opt) => updateSelection('birth', opt)}
              getOptionId={(o) => o.id}
              getOptionName={(o) => o.name}
              variant="dropdown"
              renderSelectedDetail={renderBackstoryDetail}
              ghostUnselectedWhenSelected
              isComplete={!!selections.birth && (selections.birth ? selections.birth.grants.every((_, i) => selections.grantPicks[`${selections.birth!.id}-${i}`]) : false)}
            />
            <SelectionSection
              title="Youth"
              subheading="A defining experience from your early years."
              options={YOUTH_FRAGMENTS}
              selected={selections.youth}
              onSelect={(opt) => updateSelection('youth', opt)}
              getOptionId={(o) => o.id}
              getOptionName={(o) => o.name}
              variant="dropdown"
              renderSelectedDetail={renderBackstoryDetail}
              ghostUnselectedWhenSelected
              isComplete={!!selections.youth && (selections.youth ? selections.youth.grants.every((_, i) => selections.grantPicks[`${selections.youth!.id}-${i}`]) : false)}
            />
            <SelectionSection
              title="Coming of Age"
              subheading="The event that marked your transition to adulthood."
              options={COMING_OF_AGE_FRAGMENTS}
              selected={selections.comingOfAge}
              onSelect={(opt) => updateSelection('comingOfAge', opt)}
              getOptionId={(o) => o.id}
              getOptionName={(o) => o.name}
              variant="dropdown"
              renderSelectedDetail={renderBackstoryDetail}
              ghostUnselectedWhenSelected
              isComplete={!!selections.comingOfAge && (selections.comingOfAge ? selections.comingOfAge.grants.every((_, i) => selections.grantPicks[`${selections.comingOfAge!.id}-${i}`]) : false)}
            />
          </div>
        </main>

        <aside className="app__sidebar">
          <section className="derived-stats">
            <h3>Skills</h3>
            <dl>
              {SKILL_KEYS.map((key) => (
                <Fragment key={key}>
                  <dt>{key}</dt>
                  <dd>{skills[key]}</dd>
                </Fragment>
              ))}
            </dl>
          </section>
          <section className="derived-stats">
            <h3>Health and Mana</h3>
            <dl>
              <dt>{HP_LABEL}</dt>
              <dd>{deriveHP(skills, selections.bloodline?.id ?? null)}</dd>
              <dt>{MP_LABEL}</dt>
              <dd>{deriveMP(skills)}</dd>
              <dt>{MP_RECOVERY_LABEL}</dt>
              <dd>{deriveMPRecovery(skills)}</dd>
            </dl>
          </section>
        </aside>

        <footer className="app__footer">
          <button
            type="button"
            className="app__finish-button"
            disabled={!isComplete}
            onClick={handleFinish}
          >
            Finish Character
          </button>
        </footer>
      </div>
    </div>
  );
}
