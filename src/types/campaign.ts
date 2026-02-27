export interface BaseEntity {
    id: string;
    name: string;
    description: string;
}

export interface CampaignCharacter extends BaseEntity {
    type: 'pc' | 'npc';
    level: number;
    classOrRole?: string;
    notes: string;
}

export interface PlotLine extends BaseEntity {
    status: 'active' | 'resolved' | 'abandoned';
    relatedEntities: string[]; // references by ID
}

export interface Quest extends BaseEntity {
    status: 'available' | 'in_progress' | 'completed' | 'failed';
    giverId?: string;
    reward: string;
}

export interface Region extends BaseEntity {
    climate: string;
    dangerLevel: number;
}

export type LocationType = 'village' | 'town' | 'city' | 'dungeon' | 'landmark';

export interface Location extends BaseEntity {
    type: LocationType;
    regionId?: string;
    population?: number;
    keyNPCs?: string[]; // character IDs
}

export interface CampaignData {
    characters: CampaignCharacter[];
    plotLines: PlotLine[];
    quests: Quest[];
    regions: Region[];
    locations: Location[];
}

export const INITIAL_CAMPAIGN_DATA: CampaignData = {
    characters: [],
    plotLines: [],
    quests: [],
    regions: [],
    locations: [],
};
