/**
 * Pillar Worlds Character Creation - Type Definitions
 * All types are strictly defined per the rulebook.
 */

export type SkillKey = 'CHA' | 'INS' | 'PRW' | 'STL' | 'STR' | 'WIS';

export interface Skills {
  CHA: number;
  INS: number;
  PRW: number;
  STL: number;
  STR: number;
  WIS: number;
}

export interface BodyOption {
  id: string;
  name: string;
  bonuses: Partial<Skills>;
}

export interface SpiritOption {
  id: string;
  name: string;
  bonuses: Partial<Skills>;
}

export interface MindOption {
  id: string;
  name: string;
  bonuses: Partial<Skills>;
}

export interface ZodiacOption {
  id: string;
  name: string;
  bonuses: Partial<Skills>;
}

export type BloodlineType = 'draconic' | 'blessed' | 'cursed' | 'titanborn' | 'cosmic';

export interface Bloodline {
  id: string;
  name: string;
  type: BloodlineType;
  featureName: string;
  featureText: string;
}

export type GrantKind = 'equipmentPick' | 'masteryPick' | 'abilityPick';

export interface Grant {
  kind: GrantKind;
  count: number;
  tags?: string[];
}

export type BackstoryStage = 'birth' | 'youth' | 'comingOfAge';

export interface BackstoryFragment {
  id: string;
  stage: BackstoryStage;
  name: string;
  /** Flavour text from the rulebook describing the story fragment */
  flavourText?: string;
  grants: Grant[];
}

/** Maps grant key (e.g. "birth.birthright-0") to picked item id (ability or equipment) */
export type GrantPicks = Record<string, string>;

export interface CharacterSelections {
  name: string;
  body: BodyOption | null;
  mind: MindOption | null;
  spirit: SpiritOption | null;
  zodiac: ZodiacOption | null;
  bloodline: Bloodline | null;
  humanExtraSkill: SkillKey | null;
  birth: BackstoryFragment | null;
  youth: BackstoryFragment | null;
  comingOfAge: BackstoryFragment | null;
  /** Picks made for backstory grants (ability/equipment/mastery) */
  grantPicks: GrantPicks;
  startingEquipment: string | null;
}

export interface SavedCharacter extends CharacterSelections {
  id: string;
  createdAt: number;
  level: number;
  extraHp: number;
  skillIncreases: Partial<Skills>;
  leveledGrants: string[];
}
