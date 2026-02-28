/**
 * Equipment data types for Pillar Worlds
 */

export interface BaseItemGrants {
  armourMax?: number;
  wardMax?: number;
}

export interface BaseItem {
  id: string;
  name: string;
  type: 'weapon' | 'relic' | 'trick' | 'armour' | 'shield' | 'ward';
  subtype?: string;
  rulesText: string[];
  grants?: BaseItemGrants;
}

export interface Artifact {
  id: string;
  name: string;
  type: 'weapon' | 'relic' | 'trick' | 'armour' | 'shield' | 'ward';
  subtype: string;
  rulesText: string;
}

export interface EquipmentData {
  equipment: {
    baseItems: BaseItem[];
    artifacts: Artifact[];
  };
}
