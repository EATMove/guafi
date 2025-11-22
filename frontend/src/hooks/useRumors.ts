import { useSuiClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { guafiConfig } from '../lib/config';
import { parseRumor } from '../lib/rumorClient';
import type { RumorView } from '../lib/types';

export function useRumors() {
    const client = useSuiClient();

    return useQuery({
        queryKey: ['rumors'],
        enabled: !!guafiConfig.packageId,
        queryFn: async () => {
            if (!guafiConfig.packageId) return [];
            
            const events = await client.queryEvents({
                query: {
                    MoveModule: { 
                        package: guafiConfig.packageId, 
                        module: 'guafi' 
                    }
                },
                limit: 50,
                order: 'descending'
            });

            const createdEvents = events.data.filter(e => e.type.includes('::RumorCreated'));
            const rumorIds = createdEvents.map(e => (e.parsedJson as any).rumor_id);
            
            if (rumorIds.length === 0) return [];

            const objects = await client.multiGetObjects({
                ids: rumorIds,
                options: { showContent: true }
            });

            return objects
                .map(parseRumor)
                .filter((r): r is RumorView => r !== null);
        },
    });
}

