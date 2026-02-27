import { useState, useEffect } from 'react';
import type { CampaignData } from '../types/campaign';
import { INITIAL_CAMPAIGN_DATA } from '../types/campaign';

const STORAGE_KEY = 'pillar_worlds_campaign_data';

export function useCampaignData() {
    const [data, setData] = useState<CampaignData>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : INITIAL_CAMPAIGN_DATA;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [data]);

    const updateEntities = <K extends keyof CampaignData>(key: K, entities: CampaignData[K]) => {
        setData((prev) => ({
            ...prev,
            [key]: entities
        }));
    };

    return {
        data,
        updateEntities
    };
}
