/**
 * Pillar Worlds Monster Data
 */

import type {
  MonsterReference,
  Monster,
  MonsterAbility,
  MonsterTraitDefinition,
} from './types';
import MonsterData from './monsterData.json';

const base = MonsterData as MonsterReference;

export type {
  Monster,
  MonsterAbility,
  MonsterTraitDefinition,
  MonsterReference,
  MonsterSkills,
  MonsterEquipment,
  DragonBloodline,
} from './types';

export const monsterReference = base;
export const monsterTypes = base.monsterTypes;
export const monsterTraitDefinitions = base.monsterTraitDefinitions;
export const monsterAbilities = base.monsterAbilities;
export const monsters = base.monsters;
export const dragonBloodlines = base.dragonBloodlines ?? [];

/** Get monster by ID */
export function getMonsterById(id: string): Monster | undefined {
  return monsters.find((m) => m.id === id);
}

/** Get monsters by type (Arcane, Beasts, Celestials, etc.) */
export function getMonstersByType(type: string): Monster[] {
  return monsters.filter((m) => m.monsterType === type);
}

/** Get monster ability by ID */
export function getMonsterAbilityById(id: string): MonsterAbility | undefined {
  return monsterAbilities.find((a) => a.id === id);
}

/** Get trait definition by ID */
export function getTraitById(id: string): MonsterTraitDefinition | undefined {
  return monsterTraitDefinitions.find((t) => t.id === id);
}
