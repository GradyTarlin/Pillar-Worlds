export interface BaseEntity {
    id: string;
    name: string;
    description: string;
}

export interface CampaignFaction extends BaseEntity {
    factionType: 'religious' | 'military' | 'criminal' | 'arcane' | 'spiritual' | 'guild' | 'monster';
    leader?: string;
    goal?: string;
}

export interface CampaignCharacter extends BaseEntity {
    role?: string;
    bloodlineId?: string;
    notes: string;
    locationId?: string; // Links character to a settlement
    goal?: string;
    plan?: string;
    affiliation?: string[];
}

export interface PlotLine extends BaseEntity {
    relatedEntities: string[]; // references by ID
}

export interface Quest extends BaseEntity {
    giverId?: string;
    reward: string;
    objective: string;
    clientId?: string;
    locationId?: string; // Links quest to a settlement
    regionId?: string; // Links quest to a region
}

export interface MapPin {
    id: string;
    x: number;
    y: number;
    locationId: string; // Links to 'settlement' or 'dungeon' location
}

// Map Maker Types
export type MapBiome = 'plain' | 'forest' | 'mountain' | 'desert' | 'jungle' | 'grassland' | 'wetland' | 'taiga' | 'ocean';
export type MapFeature = 'none' | 'river' | 'lake';

export type MapPoiType = 'town' | 'city' | 'dungeon' | 'mystery';

export interface MapTile {
    biome: MapBiome;
    feature: MapFeature;
    poiId?: string; // Links to a Location (Settlement/Dungeon)
    poiType?: MapPoiType;
    label?: string; // Custom label for POIs or landmarks
}

export interface CustomMap {
    width: number;
    height: number;
    grid: Record<string, MapTile>; // Key format "x,y"
}

export interface Region extends BaseEntity {
    climate: string;
}

export type LocationType = 'settlement' | 'dungeon'; // Level 2 distinctions

export interface Location extends BaseEntity {
    type: LocationType;
    regionId?: string; // Links up to Level 1

    // Settlement specific fields
    settlementType?: 'camp' | 'village' | 'town' | 'city';
    leader?: string;
    economy?: 'farming' | 'fishing' | 'logging' | 'mining' | 'magic' | 'manufacturing';

    // Dungeon specific fields
    traps?: string;
    secrets?: string;
    loot?: string;
}

export interface CampaignMonster {
    id: string; // Unique instance ID for the campaign
    dungeonId: string; // Links to the Level 2 Dungeon
    monsterId: string; // Links to the base monster catalog ID
    name: string; // Either the base name or a custom named variant (e.g. "Goblin King")
    notes?: string;
}

export interface SessionLog extends BaseEntity {
    date: string;
    content: string;
}

export interface EncounterCombatant {
    id: string;
    name: string;
    isCharacter: boolean;
    entityId: string; // ID of CampaignCharacter or CampaignMonster
    initiative: number;
    hp: number;
    maxHp: number;
    statusEffects: string[];
}

export interface Encounter extends BaseEntity {
    locationId?: string;
    combatants: EncounterCombatant[];
    round: number;
    activeTurnIndex: number;
    isFinished: boolean;
}

export interface CampaignData {
    characters: CampaignCharacter[];
    plotLines: PlotLine[];
    quests: Quest[];
    regions: Region[];
    locations: Location[];
    monsters: CampaignMonster[];
    sessionLogs: SessionLog[];
    encounters: Encounter[];
    factions?: CampaignFaction[];
    mapImageId?: string;
    mapPins?: MapPin[];
    customMap?: CustomMap;
}

export const INITIAL_CAMPAIGN_DATA: CampaignData = {
    characters: [],
    plotLines: [],
    quests: [],
    regions: [],
    locations: [],
    monsters: [],
    sessionLogs: [],
    encounters: [],
    factions: [],
    customMap: {
        width: 40,
        height: 30,
        grid: {}
    }
};

export interface Campaign extends BaseEntity {
    data: CampaignData;
}
