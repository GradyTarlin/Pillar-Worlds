/**
 * Pillar Worlds Equipment Data
 * Import from here to access base items and artifacts.
 */

import type { EquipmentData } from './types';
import equipmentData from './equipment.json';

export type { BaseItem, Artifact, EquipmentData } from './types';

export const equipment = equipmentData as EquipmentData;

export const baseItems = equipment.equipment.baseItems;
export const artifacts = equipment.equipment.artifacts;

/** Get artifacts by type (weapon, relic, trick, armour, shield, ward) */
export function getArtifactsByType(type: string): EquipmentData['equipment']['artifacts'] {
  return artifacts.filter((a) => a.type === type);
}

/** Get artifacts by subtype (blade, bludgeon, orb, etc.) */
export function getArtifactsBySubtype(subtype: string): EquipmentData['equipment']['artifacts'] {
  return artifacts.filter((a) => a.subtype === subtype);
}

/** Base items only — for backstory equipment picks (no artifacts) */
export function getBaseItemsForEquipmentPick(): { id: string; name: string; tag: string }[] {
  return baseItems.map((b) => {
    let tag: string = b.type;
    if (tag === 'armour' || tag === 'shield' || tag === 'ward') {
      tag = 'defense';
    }
    return { id: b.id, name: b.name, tag };
  });
}

/** Get equipment name by id (base item or artifact) */
export function getEquipmentNameById(id: string): string | undefined {
  const base = baseItems.find((b) => b.id === id);
  if (base) return base.name;
  const art = artifacts.find((a) => a.id === id);
  return art?.name;
}
