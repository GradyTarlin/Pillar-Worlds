/**
 * Pillar Worlds Abilities Data
 * Import from here to access ability lists.
 */

import type { AbilitiesData } from './types';
import masteryAbilities from './masteryAbilities.json';
import aetherAlchemyDarknessAbilities from './aetherAlchemyDarknessAbilities.json';
import energyLightNatureAbilities from './energyLightNatureAbilities.json';

export type { Ability, AbilitiesData } from './types';

export const masteryAbilitiesData = masteryAbilities as AbilitiesData;
export const aetherAlchemyDarknessAbilitiesData = aetherAlchemyDarknessAbilities as AbilitiesData;
export const energyLightNatureAbilitiesData = energyLightNatureAbilities as AbilitiesData;

/** All abilities combined */
export const allAbilities = [
  ...masteryAbilitiesData.abilities,
  ...aetherAlchemyDarknessAbilitiesData.abilities,
  ...energyLightNatureAbilitiesData.abilities,
];

/** Check if an ability is available at the given character level */
export function isAbilityAvailableAtLevel(
  ability: AbilitiesData['abilities'][0],
  level: number
): boolean {
  const levelReq = ability.prerequisites.find((p) => p.kind === 'level');
  if (!levelReq || levelReq.min == null) return true;
  return level >= levelReq.min;
}

/** Get abilities by tag, filtered to those available at the given level */
export function getAbilitiesByTagForLevel(
  tag: string,
  level: number
): AbilitiesData['abilities'] {
  return allAbilities.filter(
    (a) => a.tag === tag && isAbilityAvailableAtLevel(a, level)
  );
}

/** Get abilities by tags, filtered to those available at the given level */
export function getAbilitiesByTagsForLevel(
  tags: string[],
  level: number
): AbilitiesData['abilities'] {
  return allAbilities.filter(
    (a) => tags.includes(a.tag) && isAbilityAvailableAtLevel(a, level)
  );
}

/** Get abilities by tag (e.g. 'weapon', 'aether', 'energy') */
export function getAbilitiesByTag(tag: string): AbilitiesData['abilities'] {
  return allAbilities.filter((a) => a.tag === tag);
}

/** Get abilities by tags (e.g. ['weapon', 'relic', 'trick'] for mastery) */
export function getAbilitiesByTags(tags: string[]): AbilitiesData['abilities'] {
  return allAbilities.filter((a) => tags.includes(a.tag));
}

/** Get ability by id */
export function getAbilityById(id: string): AbilitiesData['abilities'][0] | undefined {
  return allAbilities.find((a) => a.id === id);
}
