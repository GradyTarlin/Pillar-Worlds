/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Campaign, CampaignData } from '../types/campaign';
import { INITIAL_CAMPAIGN_DATA } from '../types/campaign';

const STORAGE_KEY = 'pillar_worlds_campaigns';

interface CampaignContextType {
    campaigns: Campaign[];
    activeCampaignId: string | null;
    setActiveCampaignId: (id: string | null) => void;
    createCampaign: (name: string, description: string) => void;
    deleteCampaign: (id: string) => void;
    data: CampaignData;
    updateEntities: <K extends keyof CampaignData>(key: K, entities: CampaignData[K]) => void;
}

const CampaignContext = createContext<CampaignContextType | null>(null);

export function CampaignProvider({ children }: { children: ReactNode }) {
    const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    return parsed;
                } else if (parsed && typeof parsed === 'object' && 'characters' in parsed) {
                    return [{
                        id: 'legacy-campaign',
                        name: 'My First Campaign',
                        description: 'Migrated from previous version',
                        data: parsed as CampaignData
                    }];
                }
            } catch (e) {
                console.error("Failed to parse campaigns", e);
            }
        }
        return [];
    });

    const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    }, [campaigns]);

    const activeCampaign = campaigns.find(c => c.id === activeCampaignId);
    const data = activeCampaign ? activeCampaign.data : INITIAL_CAMPAIGN_DATA;

    const createCampaign = (name: string, description: string) => {
        const newCampaign: Campaign = {
            id: `campaign_${Date.now()}`,
            name,
            description,
            data: INITIAL_CAMPAIGN_DATA
        };
        setCampaigns([...campaigns, newCampaign]);
    };

    const deleteCampaign = (id: string) => {
        setCampaigns(campaigns.filter(c => c.id !== id));
        if (activeCampaignId === id) {
            setActiveCampaignId(null);
        }
    };

    const updateEntities = <K extends keyof CampaignData>(key: K, entities: CampaignData[K]) => {
        if (!activeCampaignId) return;
        setCampaigns(prev => prev.map(c => {
            if (c.id === activeCampaignId) {
                return {
                    ...c,
                    data: {
                        ...c.data,
                        [key]: entities
                    }
                };
            }
            return c;
        }));
    };

    return (
        <CampaignContext.Provider value={{
            campaigns,
            activeCampaignId,
            setActiveCampaignId,
            createCampaign,
            deleteCampaign,
            data,
            updateEntities
        }}>
            {children}
        </CampaignContext.Provider>
    );
}

export function useCampaignData() {
    const context = useContext(CampaignContext);
    if (!context) {
        throw new Error('useCampaignData must be used within a CampaignProvider');
    }
    return context;
}
