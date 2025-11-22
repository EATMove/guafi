import { useState } from 'react';
import { useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit';
import { downloadBlob } from '../lib/walrus/downloadHTTP';
import { decryptRumorContent } from '../lib/seal';
import type { RumorView, TicketView } from '../lib/types';

export function useDecryptRumor() {
    const account = useCurrentAccount();
    const { mutateAsync: signMsg } = useSignPersonalMessage();
    
    const [contentUrl, setContentUrl] = useState<string | null>(null);
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const decrypt = async (rumor: RumorView, ticket: TicketView | null | undefined) => {
        if (!account) return setError('Please connect wallet');
        
        // Creator flow not supported yet in UI unless they have a ticket, 
        // but logic allows if we implement seal_approve_creator in SDK
        if (!ticket) return setError('Creator decryption flow pending implementation');

        setIsDecrypting(true);
        setError(null);

        try {
            // 1. Download
            const encryptedBytes = await downloadBlob(rumor.blobId);
            
            // 2. Decrypt
            const decryptedBytes = await decryptRumorContent(
                encryptedBytes,
                rumor.id,
                ticket.id,
                account.address,
                signMsg
            );

            // 3. Display (Force PDF for now as per requirement)
            const blob = new Blob([decryptedBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setContentUrl(url);

        } catch (err) {
            console.error(err);
            setError((err as Error).message);
        } finally {
            setIsDecrypting(false);
        }
    };

    return { decrypt, contentUrl, isDecrypting, error };
}

