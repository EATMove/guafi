import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { buildJoinRumorTx, describeStatus, parseRumor, readablePrice } from '../lib/rumorClient';
import { guafiConfig } from '../lib/config';
import { formatSui } from '../lib/format';

const RumorDetail: React.FC = () => {
    const { id } = useParams();
    const client = useSuiClient();
    const account = useCurrentAccount();
    const { mutateAsync, isPending } = useSignAndExecuteTransaction();
    const [joined, setJoined] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: rumor, isLoading, refetch } = useQuery({
        queryKey: ['rumor', id],
        enabled: Boolean(id),
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        queryFn: async () => {
            if (!id) throw new Error('Missing rumor id');
            const obj = await client.getObject({ id, options: { showContent: true } });
            if (!obj.data || obj.error) throw new Error('Rumor not found');
            const parsed = parseRumor(obj);
            if (!parsed) throw new Error('Rumor not found');
            return parsed;
        },
    });

    const progress = rumor ? (rumor.minParticipants === 0 ? 0 : Math.min((rumor.participants / rumor.minParticipants) * 100, 100)) : 0;

    const handleJoin = async () => {
        setError(null);
        if (!account) {
            setError('Please connect your wallet first');
            return;
        }
        if (!guafiConfig.configId) {
            setError('Missing VITE_CONFIG_ID; cannot call join');
            return;
        }
        if (!rumor) return;

        const tx = buildJoinRumorTx(rumor.id, rumor.price);
        await mutateAsync(
            { transaction: tx },
            {
                onSuccess: () => {
                    setJoined(true);
                    refetch();
                },
                onError: (err) => setError((err as Error).message),
            },
        );
    };

    const statusColor = rumor?.status === 'unlocked' ? 'bg-pop-green text-white' : rumor?.status === 'failed' ? 'bg-pop-pink text-white' : 'bg-pop-yellow text-pop-black';

    return (
        <div className="max-w-3xl mx-auto animate-bounce-in">
            <Card className="overflow-hidden p-0">
                <div className="bg-pop-yellow/20 p-8 border-b-4 border-pop-black">
                    <div className="flex justify-between items-center mb-4">
                        <span className={`px-4 py-1 border-2 border-pop-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${statusColor}`}>
                            {rumor ? describeStatus(rumor.status) : '...'}
                        </span>
                        <span className="text-pop-black font-mono font-bold text-lg truncate max-w-[200px]">ID: {id}</span>
                    </div>
                    <h1 className="text-4xl font-black text-pop-black leading-tight break-words">
                        {rumor?.title || 'Loading rumor...'}
                    </h1>
                    <p className="text-sm text-gray-600 font-bold mt-2 break-words">Creator: {rumor?.creator}</p>
                </div>

                <div className="p-8 space-y-8">
                    {isLoading && <p className="font-bold text-pop-black">Loading...</p>}

                    {rumor && (
                        <>
                            <div className="bg-white p-6 border-2 border-pop-black shadow-hard rounded-xl">
                                <div className="flex justify-between text-lg font-bold text-pop-black mb-4">
                                    <span>Progress</span>
                                    <span>{rumor.participants}/{rumor.minParticipants} Participants</span>
                                </div>
                                <div className="w-full bg-gray-100 border-2 border-pop-black rounded-full h-6 p-0.5">
                                    <div
                                        className={`h-full rounded-full border border-pop-black transition-all duration-500 ${rumor.status === 'unlocked' ? 'bg-pop-green' : 'bg-pop-blue'
                                            }`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <p className="text-base font-bold text-gray-500 mt-3 text-right">
                                    {rumor.status === 'unlocked' ? 'Target reached! Content unlocked.' : `${Math.max(rumor.minParticipants - rumor.participants, 0)} more needed to unlock.`}
                                </p>
                            </div>

                            <div className="border-2 border-pop-black rounded-xl p-8 bg-gray-50 shadow-hard">
                                <h3 className="text-2xl font-black mb-6 border-b-2 border-pop-black pb-2 inline-block">Rumor Content</h3>
                                {rumor.status === 'unlocked' ? (
                                    <div className="prose max-w-none text-lg font-medium text-pop-black">
                                        <p>Rumor ciphertext stored in Walrus blob: {rumor.blobId}</p>
                                        <p className="text-sm text-gray-500">Frontend needs Seal to decrypt before showing content; placeholder for now.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                        <div className="bg-gray-200 p-6 rounded-full mb-6 border-2 border-gray-300">
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                            </svg>
                                        </div>
                                        <p className="text-xl font-bold text-pop-black mb-2">Content is Encrypted</p>
                                        <p className="text-base font-medium">Join this rumor to help unlock it.</p>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="bg-pop-pink/10 border-2 border-pop-pink p-3 font-bold text-pop-black">
                                    {error}
                                </div>
                            )}

                            {rumor.status === 'pending' && (
                                <div className="border-t-4 border-pop-black pt-8">
                                    <div className="flex items-center justify-between mb-6 bg-pop-blue/10 p-4 rounded-xl border-2 border-pop-blue">
                                        <div>
                                            <p className="text-sm font-bold text-pop-blue uppercase tracking-wider">Entry Price</p>
                                            <p className="text-3xl font-black text-pop-black">{readablePrice(rumor)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-pop-blue uppercase tracking-wider">Reward Pool</p>
                                            <p className="text-xl font-black text-pop-green">{formatSui(rumor.rewardPool)} SUI</p>
                                        </div>
                                    </div>

                                    {joined ? (
                                        <div className="bg-pop-green text-white p-4 rounded-xl text-center font-bold text-xl border-2 border-pop-black shadow-hard animate-bounce-in">
                                            You have joined! Waiting for others...
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={handleJoin}
                                            size="lg"
                                            className="w-full text-xl py-4"
                                            disabled={isPending}
                                        >
                                            {isPending ? 'Joining...' : `Pay ${readablePrice(rumor)} to Join`}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default RumorDetail;
