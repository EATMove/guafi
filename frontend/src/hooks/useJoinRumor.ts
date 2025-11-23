import { useState } from 'react';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { useQueryClient } from '@tanstack/react-query';
import { buildJoinRumorTx } from '../lib/rumorParse';
import { guafiConfig } from '../lib/config';
import type { RumorView } from '../lib/types';

export function useJoinRumor(onSuccess?: () => void) {
    const client = useSuiClient();
    const { mutateAsync: signAndExec, isPending } = useSignAndExecuteTransaction();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const join = async (rumor: RumorView) => {
        setError(null);
        setIsProcessing(true);
        if (!guafiConfig.configId) {
            setIsProcessing(false);
            return setError('Config ID missing');
        }

        try {
            const tx = buildJoinRumorTx(rumor.id, rumor.price);
            await signAndExec(
                { transaction: tx },
                {
                    onSuccess: async (result) => {
                        // Wait for the transaction to be indexed
                        await client.waitForTransaction({
                            digest: result.digest,
                        });

                        // Invalidate all rumor-related queries to force refresh
                        await queryClient.invalidateQueries({ queryKey: ['rumor'] });
                        await queryClient.invalidateQueries({ queryKey: ['rumors'] });
                        await queryClient.invalidateQueries({ queryKey: ['ticket'] });

                        onSuccess?.();
                    },
                    onError: (err) => setError(err.message),
                }
            );
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsProcessing(false);
        }
    };

    return { join, isJoining: isPending || isProcessing, error };
}

