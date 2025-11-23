import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { buildClaimRewardTx, parseRumor, parseTicket, rewardAmount, describeStatus } from '../lib/rumorParse';
import { guafiConfig } from '../lib/config';
import { formatSui, shortAddress } from '../lib/format';
import type { TicketView, RumorView } from '../lib/types';
import { computeUserStats } from '../lib/stats';
import { useRumors } from '../hooks/useRumors';

const Profile: React.FC = () => {
    const { t } = useTranslation();
    const account = useCurrentAccount();
    const client = useSuiClient();
    const { mutateAsync, isPending } = useSignAndExecuteTransaction();
    const [error, setError] = useState<string | null>(null);
    const statsEnabled = Boolean(account?.address && guafiConfig.packageId);

    // Fetch all rumors to find created ones
    const { data: allRumors } = useRumors();
    const createdRumors = useMemo(() => {
        if (!account?.address || !allRumors) return [];
        return allRumors.filter(rumor => rumor.creator === account.address);
    }, [allRumors, account?.address]);

    const { data: tickets, isLoading, refetch, isFetching } = useQuery<Array<{ ticket: TicketView; rumor: RumorView }>>({
        queryKey: ['tickets', account?.address],
        enabled: statsEnabled,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchInterval: 60_000,
        queryFn: async () => {
            if (!account?.address) return [];
            if (!guafiConfig.packageId) throw new Error('Missing VITE_PACKAGE_ID');
            const ticketType = `${guafiConfig.packageId}::guafi::Ticket`;
            const owned = await client.getOwnedObjects({
                owner: account.address,
                filter: { StructType: ticketType },
                options: { showContent: true },
            });

            const parsedTickets = owned.data.map(parseTicket).filter(Boolean) as TicketView[];
            if (parsedTickets.length === 0) return [];
            const rumorIds = Array.from(new Set(parsedTickets.map((t) => t.rumorId)));
            const rumorObjects = await client.multiGetObjects({ ids: rumorIds, options: { showContent: true } });
            const rumorMap = new Map<string, RumorView>();
            rumorObjects
                .filter((obj) => obj.data && !obj.error)
                .forEach((obj) => {
                    const parsed = parseRumor(obj);
                    if (parsed && obj.data?.objectId) {
                        rumorMap.set(obj.data.objectId, parsed);
                    }
                });

            return parsedTickets
                .map((ticket) => ({ ticket, rumor: rumorMap.get(ticket.rumorId) as RumorView | null }))
                .filter((pair): pair is { ticket: TicketView; rumor: RumorView } => Boolean(pair.rumor));
        },
    });

    const summary = useMemo(() => {
        if (!tickets) return { spent: 0n, earned: 0n, count: 0 };
        let spent = 0n;
        let earned = 0n;
        tickets.forEach(({ ticket, rumor }) => {
            spent += rumor.price;
            earned += rewardAmount(rumor, ticket);
        });
        return { spent, earned, count: tickets.length };
    }, [tickets]);

    const { data: aggregatedStats } = useQuery({
        queryKey: ['aggregatedStats', account?.address],
        enabled: statsEnabled,
        staleTime: 120_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchInterval: 120_000,
        queryFn: async () => {
            if (!account?.address || !guafiConfig.packageId) {
                return {
                    creator: { alphaEarned: 0n, joinCount: 0 },
                    participant: { spent: 0n, claimed: 0n, joins: 0 },
                };
            }
            return computeUserStats(client, guafiConfig.packageId, account.address);
        },
    });

    const totalPending = summary.earned;
    const totalClaimed = aggregatedStats?.participant.claimed ?? 0n;
    const totalEarnedCombined = totalPending + totalClaimed;

    const handleClaim = async (rumorId: string, ticketId: string) => {
        setError(null);
        const tx = buildClaimRewardTx(rumorId, ticketId);
        await mutateAsync(
            { transaction: tx },
            {
                onSuccess: () => refetch(),
                onError: (err) => setError((err as Error).message),
            },
        );
    };

    if (!account) {
        return (
            <Card className="bg-white">
                <p className="font-bold text-pop-black">{t('profile.connect_wallet')}</p>
            </Card>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-bounce-in">
            <Card className="mb-8 bg-white border-comic shadow-comic rounded-none">
                <div className="flex items-center space-x-6">
                    <div className="h-20 w-20 bg-pop-blue text-white rounded-full flex items-center justify-center text-4l border-comic shadow-comic">
                        🍉
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-pop-black">{t('profile.title')}</h1>
                        <p className="text-gray-500 font-bold font-mono">{shortAddress(account.address, 8, 6)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-pop-blue/10 p-6 border-comic shadow-comic rounded-none relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-pop-blue/20 text-6xl font-black rotate-12">¥</div>
                        <p className="text-sm text-pop-blue font-bold uppercase tracking-wider">{t('profile.total_spent')}</p>
                        <p className="text-3xl font-black text-pop-black">{formatSui(aggregatedStats?.participant.spent ?? summary.spent)} SUI</p>
                    </div>
                    <div className="bg-pop-pink/10 p-6 border-comic shadow-comic rounded-none relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-pop-pink/20 text-6xl font-black -rotate-12">★</div>
                        <p className="text-sm text-pop-pink font-bold uppercase tracking-wider">{t('profile.rumors_joined')}</p>
                        <p className="text-3xl font-black text-pop-black">{aggregatedStats?.participant.joins ?? summary.count}</p>
                    </div>
                    <div className="bg-white p-5 border-comic shadow-comic rounded-none">
                        <p className="text-sm font-bold text-pop-black uppercase tracking-wider">{t('profile.creator_earnings')}</p>
                        <p className="text-3xl font-black text-pop-black">{formatSui(aggregatedStats?.creator.alphaEarned ?? 0n)} SUI</p>
                        <p className="text-xs font-bold text-gray-500 mt-1">{t('profile.joins_count')}: {aggregatedStats?.creator.joinCount ?? 0}</p>
                    </div>
                    <div className="bg-white p-5 border-comic shadow-comic rounded-none">
                        <p className="text-sm font-bold text-pop-black uppercase tracking-wider">{t('profile.participant_earned')}</p>
                        <p className="text-3xl font-black text-pop-black">{formatSui(totalEarnedCombined)} SUI</p>
                        <p className="text-xs font-bold text-gray-500 mt-1">{t('profile.pending')}: {formatSui(totalPending)} / {t('profile.claimed')}: {formatSui(totalClaimed)}</p>
                    </div>
                </div>
            </Card >

            {/* Created Rumors Section */}
            {createdRumors.length > 0 && (
                <>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-pop-black pl-2 border-l-8 border-pop-pink">
                            {t('profile.created_rumors')}
                        </h2>
                        <span className="text-sm font-bold text-gray-500">
                            {createdRumors.length} {createdRumors.length === 1 ? 'Rumor' : 'Rumors'}
                        </span>
                    </div>
                    <div className="space-y-4 mb-12">
                        {createdRumors.map((rumor, index) => (
                            <div key={rumor.id} className="animate-bounce-in" style={{ animationDelay: `${index * 100}ms` }}>
                                <Card className="flex flex-col md:flex-row justify-between items-center p-6 shadow-comic-hover border-comic rounded-none bg-white">
                                    <div className="mb-4 md:mb-0 flex-grow">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className={`px-2 py-0.5 border-2 border-pop-black font-bold uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${rumor.status === 'unlocked' ? 'bg-pop-green text-white' :
                                                    rumor.status === 'failed' ? 'bg-pop-pink text-white' :
                                                        'bg-pop-yellow text-pop-black'
                                                }`}>
                                                {describeStatus(rumor.status)}
                                            </span>
                                            <span className="text-gray-500 font-mono font-bold truncate max-w-[120px]">{rumor.id}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-pop-black break-words">{rumor.title}</h3>
                                        <div className="flex items-center gap-4 mt-2 text-sm font-bold text-gray-600">
                                            <span>💰 {formatSui(rumor.price)} SUI</span>
                                            <span>👥 {rumor.participants}/{rumor.minParticipants}</span>
                                            <span>🏆 {formatSui(rumor.rewardPool)} SUI Pool</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <Link to={`/rumor/${rumor.id}`}>
                                            <Button variant="outline" size="sm">
                                                {t('profile.view')}
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-pop-black pl-2 border-l-8 border-pop-yellow">{t('profile.participated_rumors')}</h2>
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching || isPending}>
                    {isFetching ? t('profile.refreshing') : t('profile.refresh')}
                </Button>
            </div>
            {
                error && (
                    <Card className="bg-pop-pink/10 border-pop-pink text-pop-black font-bold mb-4">
                        {error}
                    </Card>
                )
            }
            {isLoading && <Card className="bg-white"><p className="font-bold text-pop-black">{t('profile.loading_tickets')}</p></Card>}
            {
                !isLoading && tickets?.length === 0 && (
                    <Card className="bg-white">
                        <p className="font-bold text-pop-black">{t('profile.no_tickets')}</p>
                    </Card>
                )
            }
            <div className="space-y-4">
                {tickets?.map(({ ticket, rumor }, index) => {
                    const reward = rewardAmount(rumor, ticket);
                    return (
                        <div key={ticket.id} className="animate-bounce-in" style={{ animationDelay: `${index * 100}ms` }}>
                            <Card className="flex flex-col md:flex-row justify-between items-center p-6 shadow-comic-hover border-comic rounded-none bg-white">
                                <div className="mb-4 md:mb-0">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className={`px-2 py-0.5 border-2 border-pop-black font-bold uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${rumor.status === 'unlocked' ? 'bg-pop-green text-white' : rumor.status === 'failed' ? 'bg-pop-pink text-white' : 'bg-pop-yellow text-pop-black'
                                            }`}>
                                            {describeStatus(rumor.status)}
                                        </span>
                                        <span className="text-gray-500 font-mono font-bold truncate max-w-[120px]">{rumor.id}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-pop-black break-words">{rumor.title}</h3>
                                </div>

                                <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end">
                                    {reward > 0n && (
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-500 uppercase">{t('profile.claimable_reward')}</p>
                                            <p className="text-xl font-black text-pop-green">{formatSui(reward)} SUI</p>
                                        </div>
                                    )}

                                    {reward > 0n ? (
                                        <Button variant="primary" size="sm" className="bg-pop-green hover:bg-green-400" disabled={isPending} onClick={() => handleClaim(rumor.id, ticket.id)}>
                                            {t('profile.claim')}
                                        </Button>
                                    ) : (
                                        <Link to={`/rumor/${rumor.id}`}>
                                            <Button variant="outline" size="sm">
                                                {t('profile.view')}
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </div >
    );
};

export default Profile;
