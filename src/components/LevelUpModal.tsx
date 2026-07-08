import { useState } from 'react';
import type { SavedCharacter, SkillKey } from '../types';
import { SKILL_KEYS, SKILL_NAMES } from '../ruleData';
import { deriveSkills } from '../derivation';
import aetherAlchemyDarknessAbilities from '../data/abilities/aetherAlchemyDarknessAbilities.json';
import energyLightNatureAbilities from '../data/abilities/energyLightNatureAbilities.json';
import masteryAbilities from '../data/abilities/masteryAbilities.json';
import type { Ability } from '../data/abilities';

const allAbilities = [
    ...aetherAlchemyDarknessAbilities.abilities,
    ...energyLightNatureAbilities.abilities,
    ...masteryAbilities.abilities,
] as Ability[];

function getAbilityCategory(ability: Ability): string {
    if (ability.tree === 'weaponMastery') return 'Weapon Mastery';
    if (ability.tree === 'relicMastery') return 'Relic Mastery';
    if (ability.tree === 'trickMastery') return 'Trick Mastery';
    if (ability.tree === 'defenseMastery') return 'Defence Mastery';
    if (ability.tree === 'power' && ability.tag) {
        return ability.tag.charAt(0).toUpperCase() + ability.tag.slice(1);
    }
    return 'Other';
}

interface LevelUpModalProps {
    character: SavedCharacter;
    onClose: () => void;
    onSave: (updates: Partial<SavedCharacter>) => void;
}

export function LevelUpModal({ character, onClose, onSave }: LevelUpModalProps) {
    const [step, setStep] = useState(1);
    const [selectedSkill, setSelectedSkill] = useState<SkillKey | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedGrant, setSelectedGrant] = useState<string | null>(null);

    // Derive current skills to determine caps
    const currentSkills = deriveSkills(character, character.skillIncreases);
    const newLevel = character.level + 1;
    const hpIncrease = 1;

    // Determine current tier cap
    const getSkillCap = (level: number) => {
        if (level <= 4) return 4;
        if (level <= 8) return 6;
        return 8; // Tier 3
    };
    const maxSkillLevel = getSkillCap(newLevel);

    // Collect picked grants from character creation
    const backstoryFragments = [character.birth, character.youth, character.comingOfAge].filter(Boolean) as NonNullable<SavedCharacter['birth']>[];
    const genesisPicks = backstoryFragments.flatMap(f => f.grants.map((_, i) => character.grantPicks[`${f.id}-${i}`])).filter(Boolean) as string[];
    const allCurrentPicks = [...genesisPicks, ...character.leveledGrants];

    // Evaluate prerequisites
    const isPrerequisiteMet = (prereqs: Ability['prerequisites']) => {
        if (!prereqs || prereqs.length === 0) return true;
        for (const prereq of prereqs) {
            if (prereq.kind === 'level' && (prereq as { kind: 'level', min: number }).min > newLevel) return false;
            if (prereq.kind === 'ability' && !allCurrentPicks.includes((prereq as { kind: 'ability', id: string }).id)) return false;
        }
        return true;
    };

    const availableAbilities = allAbilities.filter(ab =>
        !allCurrentPicks.includes(ab.id) && isPrerequisiteMet(ab.prerequisites || [])
    );

    const categories = Array.from(new Set(availableAbilities.map(getAbilityCategory))).sort();
    const abilitiesInCategory = selectedCategory ? availableAbilities.filter(a => getAbilityCategory(a) === selectedCategory) : [];

    const handleFinish = () => {
        if (!selectedSkill || !selectedGrant) return;

        const newSkillIncreases = { ...character.skillIncreases };
        newSkillIncreases[selectedSkill] = (newSkillIncreases[selectedSkill] || 0) + 1;

        onSave({
            level: newLevel,
            extraHp: character.extraHp + hpIncrease,
            skillIncreases: newSkillIncreases,
            leveledGrants: [...character.leveledGrants, selectedGrant]
        });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, padding: '1rem'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, var(--parchment) 0%, var(--parchment-dark) 100%)',
                border: '3px double var(--burgundy)',
                borderRadius: '4px',
                width: '100%', maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                color: 'var(--ink)'
            }}>
                <h2 style={{ color: 'var(--ink)', marginBottom: '1.5rem', textAlign: 'center', position: 'relative', fontFamily: '"Cinzel", serif', letterSpacing: '0.1em' }}>
                    Level Up to Level {newLevel}!
                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', right: 0, top: '-0.5rem', background: 'transparent', border: 'none', color: 'var(--ink-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
                    >
                        ×
                    </button>
                </h2>

                {step === 1 && (
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--ink)', fontFamily: '"Cinzel", serif' }}>Step 1: Vitality Increase</h3>
                        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--ink)' }}>
                            You gained <strong>+1 Max HP</strong>!
                        </p>
                        <button className="app__finish-button" onClick={() => setStep(2)}>
                            Continue to Skills
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--ink)', fontFamily: '"Cinzel", serif' }}>Step 2: Skill Increase</h3>
                        <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                            Select one skill to increase by 1. Your current tier cap is {maxSkillLevel}.
                        </p>
                        <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '2rem' }}>
                            {SKILL_KEYS.map(key => {
                                const currentVal = currentSkills[key];
                                const isCapped = currentVal >= maxSkillLevel;
                                return (
                                    <button
                                        key={key}
                                        disabled={isCapped}
                                        onClick={() => setSelectedSkill(key)}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            padding: '1rem',
                                            background: selectedSkill === key ? 'linear-gradient(135deg, #c4d4b0 0%, #a8b898 100%)' : '#e0d4c0',
                                            border: '2px solid',
                                            borderColor: selectedSkill === key ? 'var(--forest)' : '#8b7355',
                                            color: 'var(--ink)',
                                            borderRadius: '4px',
                                            cursor: isCapped ? 'not-allowed' : 'pointer',
                                            opacity: isCapped ? 0.5 : 1,
                                            fontWeight: selectedSkill === key ? 'bold' : 'normal'
                                        }}
                                    >
                                        <span>{SKILL_NAMES[key]} ({key})</span>
                                        <span>{currentVal} → {isCapped ? 'MAX' : currentVal + 1}</span>
                                    </button>
                                )
                            })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button className="app__back-button" onClick={() => setStep(1)}>Back</button>
                            <button
                                className="app__finish-button"
                                disabled={!selectedSkill}
                                onClick={() => setStep(3)}
                            >
                                Continue to Abilities
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--ink)', fontFamily: '"Cinzel", serif' }}>Step 3: New Ability</h3>
                        <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                            Choose an ability category, then select a new ability to learn.
                        </p>

                        <select
                            value={selectedCategory ?? ''}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setSelectedGrant(null);
                            }}
                            className="app__select"
                            style={{ width: '100%', marginBottom: '1rem' }}
                        >
                            <option value="">-- Select a Category --</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>

                        {selectedCategory && (
                            <select
                                value={selectedGrant ?? ''}
                                onChange={(e) => setSelectedGrant(e.target.value)}
                                className="app__select"
                                style={{ width: '100%', marginBottom: '1rem' }}
                            >
                                <option value="" disabled>-- Select an Ability --</option>
                                {abilitiesInCategory.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} {a.prerequisites && a.prerequisites.length > 0 ? `(Tier ${a.tier})` : ''}
                                    </option>
                                ))}
                            </select>
                        )}

                        {selectedGrant && (
                            (() => {
                                const selectedAbility = allAbilities.find(a => a.id === selectedGrant);
                                if (!selectedAbility) return null;
                                return (
                                    <div style={{
                                        marginBottom: '1.5rem',
                                        padding: '1rem',
                                        background: 'rgba(0, 0, 0, 0.05)',
                                        border: '1px solid rgba(139, 115, 85, 0.3)',
                                        borderRadius: '4px',
                                        color: 'var(--ink)'
                                    }}>
                                        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontFamily: '"Cinzel", serif', color: 'var(--burgundy)' }}>
                                                {selectedAbility.name}
                                            </h4>
                                            {selectedAbility.mpCost && (
                                                <span style={{ fontSize: '0.85rem', color: 'var(--forest)', fontWeight: 'bold' }}>
                                                    ({selectedAbility.mpCost} MP)
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', paddingLeft: '0.75rem', borderLeft: '2px solid rgba(139, 115, 85, 0.4)' }}>
                                            {selectedAbility.trigger && (
                                                <div style={{ fontStyle: 'italic', marginBottom: '0.25rem' }}>
                                                    <strong>Trigger:</strong> {selectedAbility.trigger}
                                                </div>
                                            )}
                                            {selectedAbility.requiresAttention && (
                                                <div style={{ color: 'var(--attention-color, #d90429)', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                                                    Requires Attention
                                                </div>
                                            )}
                                            {selectedAbility.check && (
                                                <div style={{ marginBottom: '0.25rem', fontWeight: 'bold' }}>
                                                    {selectedAbility.check.attackerSkill}
                                                    {selectedAbility.check.defenderSkill ? ` vs. ${selectedAbility.check.defenderSkill}` : ''}
                                                    {selectedAbility.check.range || selectedAbility.check.area ? ` (` : ''}
                                                    {selectedAbility.check.range && `range: ${selectedAbility.check.range}`}
                                                    {selectedAbility.check.range && selectedAbility.check.area ? `, ` : ''}
                                                    {selectedAbility.check.area && `area: ${selectedAbility.check.area}`}
                                                    {selectedAbility.check.range || selectedAbility.check.area ? `)` : ''}
                                                </div>
                                            )}
                                            <div style={{ lineHeight: '1.4', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                                                {selectedAbility.rulesText}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button className="app__back-button" onClick={() => setStep(2)}>Back</button>
                            <button
                                className="app__finish-button"
                                disabled={!selectedGrant}
                                onClick={handleFinish}
                            >
                                Complete Level Up
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
