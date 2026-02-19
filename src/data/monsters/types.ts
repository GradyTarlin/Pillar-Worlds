/**
 * Monster data types for Pillar Worlds
 */

export type MonsterTraitCategory = 'offensive' | 'survivability' | 'magic' | 'trickery';

export interface MonsterTraitDefinition {
  id: string;
  category: MonsterTraitCategory;
  rulesText: string;
}

export interface MonsterAbilityCheck {
  attackerSkill?: string;
  defenderSkill?: string | null;
  range?: string;
  area?: string;
  notes?: string;
}

export interface MonsterAbility {
  id: string;
  name: string;
  check: MonsterAbilityCheck | null;
  rulesText: string;
}

export interface MonsterEquipment {
  name: string;
  rulesText: string;
}

export interface MonsterSkills {
  STR?: number;
  PRW?: number;
  INS?: number;
  WIS?: number;
  STL?: number;
  CHA?: number;
}

export interface Monster {
  id: string;
  name: string;
  monsterType: string;
  level: number;
  hpMax: number;
  armourMax: number;
  wardMax: number;
  traits: string[];
  skills: MonsterSkills;
  abilities: string[];
  equipment: MonsterEquipment[];
  loreText: string;
  notes: string[];
}

export interface DragonBloodline {
  bloodline: string;
  traits: string[];
}

export interface MonsterReference {
  sourceSection: string;
  monsterTypes: string[];
  monsterTraitDefinitions: MonsterTraitDefinition[];
  monsterAbilities: MonsterAbility[];
  monsters: Monster[];
  dragonBloodlines?: DragonBloodline[];
}
