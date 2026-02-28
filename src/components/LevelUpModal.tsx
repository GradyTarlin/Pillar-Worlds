import { useState } from 'react';
import type { SavedCharacter, SkillKey } from '../types';
import { SKILL_KEYS, SKILL_NAMES } from '../ruleData';
import { deriveSkills } from '../derivation';
import { getBaseItemsForEquipmentPick } from '../data/equipment';
import aetherAlchemyDarknessAbilities from '../data/abilities/aetherAlchemyDarknessAbilities.json';
import energyLightNatureAbilities from '../data/abilities/energyLightNatureAbilities.json';
import masteryAbilities from '../data/abilities/masteryAbilities.json';
import type { Ability } from '../data/abilities';

const allAbilities = [
    ...aetherAlchemyDarknessAbilities.abilities,
    ...energyLightNatureAbilities.abilities,
    ...masteryAbilities.abilities,
] as Ability[];

interface LevelUpModalProps {
    character: SavedCharacter;
    onClose: () => void;
    onSave: (updates: Partial<SavedCharacter>) => void;
}

export function LevelUpModal({ character, onClose, onSave }: LevelUpModalProps) {
    const [step, setStep] = useState(1);
    const [selectedSkill, setSelectedSkill] = useState<SkillKey | null>(null);
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
    const isPrerequisiteMet = (prereqs: any[]) => {
        if (!prereqs || prereqs.length === 0) return true;
        for (const prereq of prereqs) {
            if (prereq.kind === 'level' && prereq.min > newLevel) return false;
            if (prereq.kind === 'ability' && !allCurrentPicks.includes(prereq.id)) return false;
        }
        return true;
    };

    const availableAbilities = allAbilities.filter(ab =>
        !allCurrentPicks.includes(ab.id) && isPrerequisiteMet(ab.prerequisites || [])
    );

    const equipmentOptions = getBaseItemsForEquipmentPick()
        .filter(eq => !allCurrentPicks.includes(eq.id))
        .map(eq => ({ ...eq, type: 'equipment' }));

    const allOptions = [
        ...availableAbilities.map(a => ({ ...a, type: 'ability' })),
        ...equipmentOptions.map(e => ({ ...e, type: 'equipment', id: `equip.${e.id}` }))
    ];

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
                backgroundColor: 'var(--midnight)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                width: '100%', maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2rem'
            }}>
                <h2 style={{ color: 'var(--gold)', marginBottom: '1.5rem', textAlign: 'center', position: 'relative' }}>
                    Level Up to Level {newLevel}!
                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', right: 0, top: '-0.5rem', background: 'transparent', border: 'none', color: '#ccc', fontSize: '1.5rem', cursor: 'pointer' }}
                    >
                        ×
                    </button>
                </h2>

                {step === 1 && (
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Step 1: Vitality Increase</h3>
                        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                            You gained <strong>+1 Max HP</strong>!
                        </p>
                        <button className="app__finish-button" onClick={() => setStep(2)}>
                            Continue to Skills
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h3 style={{ marginBottom: '1rem' }}>Step 2: Skill Increase</h3>
                        <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#ccc' }}>
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
                                            backgroundColor: selectedSkill === key ? 'var(--burgundy)' : 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '4px',
                                            cursor: isCapped ? 'not-allowed' : 'pointer',
                                            opacity: isCapped ? 0.5 : 1
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
                        <h3 style={{ marginBottom: '1rem' }}>Step 3: New Ability or Equipment</h3>
                        <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                            Pick one new ability or a piece of starting equipment.
                        </p>

                        <select
                            value={selectedGrant ?? ''}
                            onChange={(e) => setSelectedGrant(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem', marginBottom: '2rem',
                                backgroundColor: 'rgba(0,0,0,0.5)', color: 'white',
                                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px'
                            }}
                        >
                            <option value="" disabled>Select an option...</option>
                            {allOptions.map((opt: any) => (
                                <option key={opt.id} value={opt.id}>
                                    [{opt.type === 'ability' ? opt.tree : 'Equipment'}] {opt.name} {opt.prerequisites?.length > 0 ? `(Tier ${opt.tier})` : ''}
                                </option>
                            ))}
                        </select>

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
