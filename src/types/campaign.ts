export interface BaseEntity {
    id: string;
    name: string;
    description: string;
}

export interface CampaignCharacter extends BaseEntity {
    role?: string;
    bloodlineId?: string;
    notes: string;
    locationId?: string; // Links character to a settlement
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
}

export interface MapPin {
    id: string;
    x: number;
    y: number;
    locationId: string; // Links to 'settlement' or 'dungeon' location
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
    mapImageId?: string;
    mapPins?: MapPin[];
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
};

export interface Campaign extends BaseEntity {
    data: CampaignData;
}
