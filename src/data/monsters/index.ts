/**
 * Pillar Worlds Monster Data
 * Merges base monster reference with patches.
 */

import type {
  MonsterReference,
  Monster,
  MonsterAbility,
  MonsterTraitDefinition,
  DragonBloodline,
} from './types';
import MonsterReferenceData from './monsterReference.json';
import MonsterPatch1 from './monsterPatch1.json';
import MonsterPatch2 from './monsterPatch2.json';
import MonsterPatch3 from './monsterPatch3.json';
import MonsterPatch4 from './monsterPatch4.json';

type MonsterPatch = {
  appendMonsterAbilities?: MonsterAbility[];
  appendMonsters?: Monster[];
  appendRules?: { dragonBloodlines?: DragonBloodline[] };
};

const base = MonsterReferenceData as MonsterReference;
const patches: MonsterPatch[] = [
  MonsterPatch1 as MonsterPatch,
  MonsterPatch2 as MonsterPatch,
  MonsterPatch3 as MonsterPatch,
  MonsterPatch4 as MonsterPatch,
];

for (const patch of patches) {
  if (patch.appendMonsterAbilities?.length) {
    base.monsterAbilities.push(...patch.appendMonsterAbilities);
  }
  if (patch.appendMonsters?.length) {
    base.monsters.push(...patch.appendMonsters);
  }
  if (patch.appendRules?.dragonBloodlines) {
    base.dragonBloodlines = patch.appendRules.dragonBloodlines;
  }
}

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
