/**
 * Ability data types for Pillar Worlds
 */

export interface AbilityPrerequisite {
  kind: 'level' | 'ability';
  min?: number;
  id?: string;
}

export interface AbilityCheck {
  attackerSkill?: string;
  defenderSkill?: string | null;
  range?: string;
  area?: string;
  notes?: string;
}

export interface Ability {
  id: string;
  name: string;
  tag: string;
  tree: string;
  subtree: string;
  tier: number;
  prerequisites: AbilityPrerequisite[];
  rulesText: string;
  mpCost?: number | string | null;
  check?: AbilityCheck | null;
  trigger?: string;
  passive?: string;
  requiresAttention?: boolean;
  notes?: string[];
}

export interface AbilitiesData {
  abilities: Ability[];
}
