import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction, useSignPersonalMessage } from '@mysten/dapp-kit';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { buildJoinRumorTx, describeStatus, parseRumor, parseTicket, readablePrice } from '../lib/rumorClient';
import { guafiConfig } from '../lib/config';
import { formatSui } from '../lib/format';
import type { TicketView } from '../lib/types';
import { downloadBlob } from '../lib/walrus/downloadHTTP';
import { decryptRumorContent } from '../lib/seal';

const RumorDetail: React.FC = () => {
    const { id } = useParams();
    const client = useSuiClient();
    const account = useCurrentAccount();
    const { mutateAsync: signAndExec, isPending: isJoinPending } = useSignAndExecuteTransaction();
    const { mutateAsync: signMsg } = useSignPersonalMessage(); 

    const [error, setError] = useState<string | null>(null);
    
    // 解密状态
    const [decryptedContentUrl, setDecryptedContentUrl] = useState<string | null>(null);
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [decryptError, setDecryptError] = useState<string | null>(null);

    // 1. 获取 Rumor
    const { data: rumor, isLoading, refetch: refetchRumor } = useQuery({
        queryKey: ['rumor', id],
        enabled: Boolean(id),
        queryFn: async () => {
            if (!id) throw new Error('Missing rumor id');
            const obj = await client.getObject({ id, options: { showContent: true } });
            if (!obj.data || obj.error) throw new Error('Rumor not found');
            const parsed = parseRumor(obj);
            if (!parsed) throw new Error('Rumor not found');
            return parsed;
        },
    });

    // 2. 获取 Ticket
    const { data: myTicket, refetch: refetchTicket } = useQuery({
        queryKey: ['ticket', id, account?.address],
        enabled: Boolean(account?.address && id && guafiConfig.packageId),
        queryFn: async () => {
            if (!account?.address || !id || !guafiConfig.packageId) return null;
            const ticketType = `${guafiConfig.packageId}::guafi::Ticket`;
            const owned = await client.getOwnedObjects({
                owner: account.address,
                filter: { StructType: ticketType },
                options: { showContent: true },
            });
            const ticket: TicketView | null =
                owned.data
                    .map(parseTicket)
                    .find((t) => t && t.rumorId === id) || null;
            return ticket;
        },
    });

    const isCreator = useMemo(() => {
        if (!rumor || !account?.address) return false;
        return rumor.creator.toLowerCase() === account.address.toLowerCase();
    }, [rumor, account]);

    // 权限检查
    const canDecrypt = useMemo(
        () => rumor?.status === 'unlocked' && (Boolean(myTicket) || isCreator),
        [rumor?.status, myTicket, isCreator]
    );

    const progress = rumor ? (rumor.minParticipants === 0 ? 0 : Math.min((rumor.participants / rumor.minParticipants) * 100, 100)) : 0;

    // --- Actions ---

    const handleJoin = async () => {
        setError(null);
        if (!account) return setError('Please connect wallet');
        if (!rumor) return;

        try {
            const tx = buildJoinRumorTx(rumor.id, rumor.price);
            await signAndExec(
                { transaction: tx },
                {
                    onSuccess: () => {
                        refetchRumor();
                        refetchTicket(); 
                    },
                    onError: (err) => setError(err.message),
                }
            );
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleDecrypt = async () => {
        if (!rumor || !account || !canDecrypt) return;
        
        if (!myTicket) {
             setDecryptError("Creator decryption flow not fully implemented yet. Please use a buyer account.");
             return;
        }

        setIsDecrypting(true);
        setDecryptError(null);
        try {
            // 1. Download
            const encryptedBytes = await downloadBlob(rumor.blobId);
            
            // 2. Decrypt
            const decryptedBytes = await decryptRumorContent(
                encryptedBytes,
                rumor.id,
                myTicket.id,
                account.address,
                signMsg
            );

            // 3. Display
            // Cast to any to avoid TypeScript issues with Uint8Array not matching BlobPart in some envs
            // Force MIME type to PDF for better preview
            const blob = new Blob([decryptedBytes as any], { type: 'application/pdf' }); 
            const url = URL.createObjectURL(blob);
            setDecryptedContentUrl(url);

        } catch (err) {
      console.error(err);
      setDecryptError((err as Error).message);
    } finally {
      setIsDecrypting(false);
    }
  };

    const statusColor = rumor?.status === 'unlocked' ? 'bg-pop-green text-white' : rumor?.status === 'failed' ? 'bg-pop-pink text-white' : 'bg-pop-yellow text-pop-black';

    if (isLoading) return <div className="text-center p-10 font-bold">Loading...</div>;
    if (!rumor) return <div className="text-center p-10 font-bold text-red-500">Rumor not found</div>;

    return (
        <div className="max-w-3xl mx-auto animate-bounce-in pb-20">
            <Card className="overflow-hidden p-0">
                <div className="bg-pop-yellow/20 p-8 border-b-4 border-pop-black">
                    <div className="flex justify-between items-center mb-4">
                        <span className={`px-4 py-1 border-2 border-pop-black font-bold uppercase text-sm shadow-hard-sm ${statusColor}`}>
                            {describeStatus(rumor.status)}
                        </span>
                        <span className="text-pop-black font-mono font-bold text-sm bg-white px-2 py-1 border border-pop-black rounded">ID: {id?.slice(0,6)}...{id?.slice(-4)}</span>
                    </div>
                    <h1 className="text-4xl font-black text-pop-black leading-tight break-words mb-4">
                        {rumor.title}
                    </h1>
                    <div className="flex items-center justify-between text-sm font-bold text-gray-600">
                        <span>Creator: {rumor.creator.slice(0,6)}...{rumor.creator.slice(-4)}</span>
                        <span>Blob: {rumor.blobId.slice(0,8)}...</span>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Progress Bar */}
                    <div className="bg-white p-6 border-2 border-pop-black shadow-hard rounded-xl">
                        <div className="flex justify-between text-lg font-bold text-pop-black mb-4">
                            <span>Unlock Progress</span>
                            <span>{rumor.participants} / {rumor.minParticipants}</span>
                        </div>
                        <div className="w-full bg-gray-100 border-2 border-pop-black rounded-full h-6 p-0.5">
                            <div
                                className={`h-full rounded-full border border-pop-black transition-all duration-500 ${rumor.status === 'unlocked' ? 'bg-pop-green' : 'bg-pop-blue'}`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm font-bold text-gray-500 mt-2 text-right">
                            {rumor.status === 'unlocked' 
                                ? '🎉 Unlocked! content is available.' 
                                : `${Math.max(rumor.minParticipants - rumor.participants, 0)} more needed.`}
                        </p>
                    </div>

                    {/* Content Section */}
                    <div className="border-2 border-pop-black rounded-xl p-8 bg-gray-50 shadow-hard min-h-[300px] flex flex-col">
                        <h3 className="text-2xl font-black mb-6 border-b-2 border-pop-black pb-2 inline-block">
                            The Secret Content
                        </h3>

                        {decryptedContentUrl ? (
                            <div className="flex-1 animate-fade-in">
                                <div className="bg-white p-4 border-2 border-pop-black rounded mb-4">
                                    <p className="font-bold text-green-600 mb-2">✅ Decrypted Successfully!</p>
                                    <div className="flex gap-2">
                                        <a 
                                            href={decryptedContentUrl} 
                                            download="secret_content.pdf"
                                            className="text-blue-600 underline font-bold hover:text-blue-800"
                                        >
                                            Download PDF
                                        </a>
                                        <span className="text-gray-400">|</span>
                                        <a 
                                            href={decryptedContentUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-blue-600 underline font-bold hover:text-blue-800"
                                        >
                                            Open PDF in New Tab
                                        </a>
                                    </div>
                                </div>
                                <iframe 
                                    src={decryptedContentUrl} 
                                    className="w-full h-[600px] border-2 border-gray-200 rounded bg-white"
                                    title="Decrypted Content"
                                >
                                    <p>Your browser does not support PDF iframes.</p>
                                </iframe>
                            </div>
                        ) : canDecrypt ? (
                            <div className="flex flex-col items-center justify-center flex-1 py-10">
                                <div className="mb-6 text-6xl">🔓</div>
                                <h4 className="text-xl font-bold mb-2">You have access!</h4>
                                <p className="text-gray-500 mb-6 text-center max-w-md">
                                    The content is encrypted on Walrus. Use your Ticket to decrypt it via Seal Network.
                                </p>
                                {decryptError && (
                                    <div className="mb-4 p-2 bg-red-100 text-red-600 text-sm font-bold border border-red-200 rounded">
                                        {decryptError}
                                    </div>
                                )}
                                <Button 
                                    onClick={handleDecrypt} 
                                    disabled={isDecrypting}
                                    size="lg"
                                    className="px-8"
                                >
                                    {isDecrypting ? 'Decrypting & Downloading...' : 'Reveal Content'}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center flex-1 py-10 text-gray-400">
                                <div className="mb-6 text-6xl">🔒</div>
                                <h4 className="text-xl font-bold text-gray-500 mb-2">Content Encrypted</h4>
                                <p className="text-sm">
                                    {rumor.status === 'unlocked' 
                                        ? 'Purchase a ticket to view this content.' 
                                        : 'Wait for more participants to unlock.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Area */}
                    <div className="space-y-4">
                        {error && (
                            <div className="bg-pop-pink/10 border-2 border-pop-pink p-3 font-bold text-pop-black">
                                Error: {error}
                            </div>
                        )}

                        {/* Join Button (Only if not joined and not creator) */}
                        {!myTicket && !isCreator && rumor.status !== 'failed' && (
                            <div className="bg-pop-blue/10 p-6 rounded-xl border-2 border-pop-blue shadow-hard">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-sm font-bold text-pop-blue uppercase">Entry Price</p>
                                        <p className="text-4xl font-black text-pop-black">{readablePrice(rumor)}</p>
                                    </div>
                                    <div className="text-right">
                                         <p className="text-xs font-bold text-gray-500">Current Reward Pool</p>
                                         <p className="text-xl font-bold text-pop-green">{formatSui(rumor.rewardPool)} SUI</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleJoin}
                                    disabled={isJoinPending}
                                    size="lg"
                                    className="w-full text-xl py-4 shadow-hard hover:translate-y-1 hover:shadow-none transition-all"
                                >
                                    {isJoinPending ? 'Processing...' : 'Pay to Join & Earn'}
                                </Button>
                                <p className="text-xs text-center mt-3 text-gray-500 font-bold">
                                    * 50% of future entry fees will be distributed to you!
                                </p>
                            </div>
                        )}
                        
                        {myTicket && (
                             <div className="bg-pop-green/20 p-4 rounded-xl border-2 border-pop-green text-center font-bold text-pop-green">
                                 🎟️ You hold a valid Ticket for this Rumor.
                             </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default RumorDetail;
