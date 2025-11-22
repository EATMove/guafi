import { useQuery } from '@tanstack/react-query';
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { guafiConfig } from '../lib/config';
import { parseRumor, parseTicket } from '../lib/rumorParse';

export function useRumorDetail(id?: string) {
    const client = useSuiClient();
    const account = useCurrentAccount();

    const rumorQuery = useQuery({
        queryKey: ['rumor', id],
        enabled: !!id,
        queryFn: async () => {
            if (!id) throw new Error('Missing ID');
            const obj = await client.getObject({ id, options: { showContent: true } });
            const parsed = parseRumor(obj);
            console.log("parsed", parsed);
            if (!parsed) throw new Error('Not found');
            return parsed;
        }
    });

    const ticketQuery = useQuery({
        queryKey: ['ticket', id, account?.address],
        enabled: !!(id && account?.address && guafiConfig.packageId),
        queryFn: async () => {
            if (!account?.address || !id || !guafiConfig.packageId) return null;
            const type = `${guafiConfig.packageId}::guafi::Ticket`;
            const owned = await client.getOwnedObjects({
                owner: account.address,
                filter: { StructType: type },
                options: { showContent: true },
            });
            return owned.data.map(parseTicket).find(t => t?.rumorId === id) || null;
        }
    });

    const isCreator = rumorQuery.data?.creator.toLowerCase() === account?.address?.toLowerCase();
    const canDecrypt = rumorQuery.data?.status === 'unlocked' && (!!ticketQuery.data || isCreator);

    return {
        rumor: rumorQuery.data,
        ticket: ticketQuery.data,
        isLoading: rumorQuery.isLoading,
        isCreator: !!isCreator,
        canDecrypt: !!canDecrypt,
        refetch: () => { 
            rumorQuery.refetch(); 
            ticketQuery.refetch(); 
        }
    };
}

