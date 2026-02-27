import { Fragment, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { CharacterSelections } from '../types';
import type { Bloodline } from '../types';
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
import { SelectionSection } from '../components/SelectionSection';
import { CharacterSheet } from '../components/CharacterSheet';
import { GrantPicker } from '../components/GrantPicker';
import '../App.css';

const INITIAL_SELECTIONS: CharacterSelections = {
  name: '',
  body: null,
  mind: null,
  spirit: null,
  zodiac: null,
  bloodline: null,
  birth: null,
  youth: null,
  comingOfAge: null,
  grantPicks: {},
};

export function CharacterCreationPage() {
  const [selections, setSelections] = useState<CharacterSelections>(INITIAL_SELECTIONS);
  const [showSheet, setShowSheet] = useState(false);

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
    selections.birth &&
    selections.youth &&
    selections.comingOfAge &&
    allGrantPicksComplete;

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
    if (isComplete) setShowSheet(true);
  };

  const handleBack = () => setShowSheet(false);

  if (showSheet) {
    return (
      <div className="app">
        <CharacterSheet selections={selections} skills={skills} />
        <div className="app__back-actions">
          <button type="button" className="app__back-button" onClick={handleBack}>
            Back to Creation
          </button>
          <Link to="/" className="app__back-button app__back-button--link">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-top">
          <Link to="/" className="app__home-link">← Home</Link>
          <h1>Pillar Worlds</h1>
        </div>
        <p className="app__subtitle">Level 1 Character Creation</p>
        <p className="app__instruction">Select one choice from each category. When you choose a backstory option, pick from the dropdown for each grant.</p>
        <div className="app__name-input-group">
          <label htmlFor="character-name" className="app__name-label">Character Name:</label>
          <input
            type="text"
            id="character-name"
            className="app__name-input"
            value={selections.name}
            onChange={(e) => updateSelection('name', e.target.value)}
            placeholder="Enter character name..."
          />
        </div>
      </header>

      <main className="app__main">
        <div className="attributes-group">
          <h3 className="attributes-group__title">Attributes</h3>
          <div className="attributes-group__content">
            <SelectionSection
              title="Body"
              subheading="Your physical build — affects Strength and Prowess."
              options={BODY_OPTIONS}
              selected={selections.body}
              onSelect={(opt) => updateSelection('body', opt)}
              getOptionId={(o) => o.id}
              getOptionName={(o) => o.name}
              renderSelectedDetail={(body) => {
                const parts = Object.entries(body.bonuses).map(
                  ([key, val]) => `${SKILL_NAMES[key as keyof typeof SKILL_NAMES]} +${val}`
                );
                return (
                  <div className="body-detail">
                    <strong>Skill bonuses:</strong> {parts.join(', ')}
                  </div>
                );
              }}
              ghostUnselectedWhenSelected
              isComplete={!!selections.body}
            />
            <SelectionSection
              title="Mind"
              subheading="Your mental approach — affects Wisdom and Instinct."
              options={MIND_OPTIONS}
              selected={selections.mind}
              onSelect={(opt) => updateSelection('mind', opt)}
              getOptionId={(o) => o.id}
              getOptionName={(o) => o.name}
              renderSelectedDetail={(mind) => {
                const parts = Object.entries(mind.bonuses).map(
                  ([key, val]) => `${SKILL_NAMES[key as keyof typeof SKILL_NAMES]} +${val}`
                );
                return (
                  <div className="body-detail">
                    <strong>Skill bonuses:</strong> {parts.join(', ')}
                  </div>
                );
              }}
              ghostUnselectedWhenSelected
              isComplete={!!selections.mind}
            />
            <SelectionSection
              title="Spirit"
              subheading="Your social disposition — affects Stealth and Charisma."
              options={SPIRIT_OPTIONS}
              selected={selections.spirit}
              onSelect={(opt) => updateSelection('spirit', opt)}
              getOptionId={(o) => o.id}
              getOptionName={(o) => o.name}
              renderSelectedDetail={(spirit) => {
                const parts = Object.entries(spirit.bonuses).map(
                  ([key, val]) => `${SKILL_NAMES[key as keyof typeof SKILL_NAMES]} +${val}`
                );
                return (
                  <div className="body-detail">
                    <strong>Skill bonuses:</strong> {parts.join(', ')}
                  </div>
                );
              }}
              ghostUnselectedWhenSelected
              isComplete={!!selections.spirit}
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
          getOptionName={(o) => o.name}
          renderOptionContent={(o) => {
            const skillKey = Object.keys(o.bonuses)[0] as keyof typeof SKILL_NAMES;
            return (
              <>
                <span className="selection-section__option-primary">{o.name}</span>
                <span className="selection-section__option-secondary">+1 {SKILL_NAMES[skillKey]}</span>
              </>
            );
          }}
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
          renderSelectedDetail={(bloodline) => (
            <div className="bloodline-detail">
              <strong>{bloodline.featureName}:</strong> {bloodline.featureText}
            </div>
          )}
          ghostUnselectedWhenSelected
          isComplete={!!selections.bloodline}
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
            renderSelectedDetail={(fragment) => (
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
                      />
                    );
                  })}
                </div>
              </div>
            )}
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
            renderSelectedDetail={(fragment) => (
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
                      />
                    );
                  })}
                </div>
              </div>
            )}
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
            renderSelectedDetail={(fragment) => (
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
                      />
                    );
                  })}
                </div>
              </div>
            )}
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
  );
}
