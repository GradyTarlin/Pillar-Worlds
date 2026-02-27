/**
 * Pillar Worlds Character Creation - Pure Derivation Functions
 * No mutation. All calculations are deterministic from selections.
 */

import type { Skills, CharacterSelections } from './types';
import { SKILL_KEYS } from './ruleData';

const INITIAL_SKILLS: Skills = {
  CHA: 0,
  INS: 0,
  PRW: 0,
  STL: 0,
  STR: 0,
  WIS: 0,
};

/**
 * Derives skill values from Body, Mind, Spirit, and Zodiac selections.
 * Skills are never manually editable.
 */
export function deriveSkills(selections: CharacterSelections): Skills {
  const skills = { ...INITIAL_SKILLS };

  const addBonuses = (bonuses: Partial<Skills> | undefined) => {
    if (!bonuses) return;
    for (const key of SKILL_KEYS) {
      const bonus = bonuses[key as keyof Skills];
      if (typeof bonus === 'number') {
        skills[key] += bonus;
      }
    }
  };

  addBonuses(selections.body?.bonuses);
  addBonuses(selections.mind?.bonuses);
  addBonuses(selections.spirit?.bonuses);
  addBonuses(selections.zodiac?.bonuses);

  return skills;
}

/**
 * HP formula: 4 + 1 + CHA
 * If Undori: HP += STR bonus
 */
export function deriveHP(skills: Skills, bloodlineId: string | null): number {
  let hp = 4 + 1 + skills.CHA;
  if (bloodlineId === 'bloodline.undori') {
    hp += skills.STR;
  }
  return hp;
}

/**
 * MP formula: 3 + WIS
 */
export function deriveMP(skills: Skills): number {
  return 3 + skills.WIS;
}

/**
 * MP Recovery formula: 1 + INS
 */
export function deriveMPRecovery(skills: Skills): number {
  return 1 + skills.INS;
}

export const LEVEL = 1;
