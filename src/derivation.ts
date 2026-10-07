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
 * Derives skill values from Body, Mind, Spirit, and Zodiac selections,
 * plus any manual skill increases gained during level up.
 * Skills are never manually editable during creation.
 */
export function deriveSkills(selections: Pick<CharacterSelections, 'body' | 'mind' | 'spirit' | 'zodiac' | 'bloodline' | 'humanExtraSkill'>, skillIncreases?: Partial<Skills>): Skills {
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

  if (selections.bloodline?.id === 'bloodline.human' && selections.humanExtraSkill) {
    skills[selections.humanExtraSkill] += 1;
  }

  addBonuses(skillIncreases);

  return skills;
}

/**
 * HP formula: 4 + 1 + CHA
 * If Undori: HP += STR bonus
 * Add extra HP gained per level.
 */
export function deriveHP(skills: Skills, bloodlineId: string | null, extraHp: number = 0): number {
  let hp = 4 + 1 + skills.CHA;
  if (bloodlineId === 'bloodline.undori') {
    hp += skills.STR;
  }
  return hp + extraHp;
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

import { equipment } from './data/equipment';
import type { BaseItem, Artifact } from './data/equipment/types';

export type DerivedEquipmentItem = (BaseItem | Artifact) & { instanceKey: string };

/**
 * Derives a list of equipment based on starting selection, backstory grants,
 * and any equipment selections made during level up.
 */
export function deriveEquipment(
  selections: Pick<CharacterSelections, 'startingEquipment' | 'grantPicks' | 'birth' | 'youth' | 'comingOfAge'> & { inventory?: string[] },
  leveledGrants: string[] = []
): DerivedEquipmentItem[] {
  const items: DerivedEquipmentItem[] = [];

  // Add explicitly chosen starting equipment
  if (selections.startingEquipment) {
    const startItem = equipment.equipment.baseItems.find(i => i.id === selections.startingEquipment);
    if (startItem) items.push({ ...startItem, instanceKey: `start-${startItem.id}` });
  }

  // Scan all grant picks for equipment choices, restricted to currently selected fragments
  const activeFragments = [selections.birth?.id, selections.youth?.id, selections.comingOfAge?.id].filter(Boolean);

  for (const [key, choiceId] of Object.entries(selections.grantPicks)) {
    const fragId = key.substring(0, key.lastIndexOf('-'));
    if (activeFragments.includes(fragId) && choiceId && choiceId.startsWith('equip.')) {
      const grantedItem = equipment.equipment.baseItems.find(i => i.id === choiceId);
      if (grantedItem) {
        items.push({ ...grantedItem, instanceKey: `grant-${key}-${grantedItem.id}` });
      }
    }
  }

  // Add equipment gained from leveling up constraints (starts with equip.)
  for (let idx = 0; idx < leveledGrants.length; idx++) {
    const choiceId = leveledGrants[idx];
    if (choiceId.startsWith('equip.')) {
      const grantedItem = equipment.equipment.baseItems.find(i => i.id === choiceId);
      if (grantedItem) {
        items.push({ ...grantedItem, instanceKey: `level-${idx}-${grantedItem.id}` });
      }
    }
  }

  // Add custom inventory items (from character inventory sheets)
  if (selections.inventory) {
    for (let idx = 0; idx < selections.inventory.length; idx++) {
      const choiceId = selections.inventory[idx];
      const grantedItem = equipment.equipment.baseItems.find(i => i.id === choiceId) ||
                          equipment.equipment.artifacts.find(i => i.id === choiceId);
      if (grantedItem) {
        items.push({ ...grantedItem, instanceKey: `inv-${idx}-${grantedItem.id}` });
      }
    }
  }

  return items;
}
