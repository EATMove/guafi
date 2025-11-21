import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { buildClaimRewardTx, parseRumor, parseTicket, rewardAmount, describeStatus } from '../lib/rumorClient';
import { guafiConfig } from '../lib/config';
import { formatSui } from '../lib/format';
import type { TicketView, RumorView } from '../lib/types';
import { computeCreatorAlpha, computeParticipantStats } from '../lib/stats';

const Profile: React.FC = () => {
    const account = useCurrentAccount();
    const client = useSuiClient();
    const { mutateAsync, isPending } = useSignAndExecuteTransaction();
    const [error, setError] = useState<string | null>(null);
    const statsEnabled = Boolean(account?.address && guafiConfig.packageId);

    const { data: tickets, isLoading, refetch, isFetching } = useQuery<Array<{ ticket: TicketView; rumor: RumorView }>>({
        queryKey: ['tickets', account?.address],
        enabled: statsEnabled,
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchInterval: 10_000,
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

    const { data: creatorStats } = useQuery({
        queryKey: ['creatorStats', account?.address],
        enabled: statsEnabled,
        staleTime: 60_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchInterval: 15_000,
        queryFn: async () => {
            if (!account?.address || !guafiConfig.packageId) return { alphaEarned: 0n, joinCount: 0 };
            return computeCreatorAlpha(client, guafiConfig.packageId, account.address);
        },
    });

    const { data: participantStats } = useQuery({
        queryKey: ['participantStats', account?.address],
        enabled: statsEnabled,
        staleTime: 60_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchInterval: 15_000,
        queryFn: async () => {
            if (!account?.address || !guafiConfig.packageId) return { spent: 0n, claimed: 0n, joins: 0 };
            return computeParticipantStats(client, guafiConfig.packageId, account.address);
        },
    });

    const totalPending = summary.earned;
    const totalClaimed = participantStats?.claimed ?? 0n;
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
                <p className="font-bold text-pop-black">Connect wallet to see your tickets.</p>
            </Card>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-bounce-in">
            <Card className="mb-8 bg-white">
                <div className="flex items-center space-x-6">
                    <div className="h-20 w-20 bg-pop-blue text-white rounded-full flex items-center justify-center text-4l border-4 border-pop-black shadow-hard">
                        🍉
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-pop-black">My Profile</h1>
                        <p className="text-gray-500 font-bold font-mono">{account.address}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-pop-blue/10 p-6 rounded-xl border-2 border-pop-blue shadow-[4px_4px_0px_0px_#4D96FF]">
                        <p className="text-sm text-pop-blue font-bold uppercase tracking-wider">Total Spent (Tickets)</p>
                        <p className="text-3xl font-black text-pop-black">{formatSui(participantStats?.spent ?? summary.spent)} SUI</p>
                    </div>
                    <div className="bg-pop-green/10 p-6 rounded-xl border-2 border-pop-green shadow-[4px_4px_0px_0px_#6BCB77]">
                        <p className="text-sm text-pop-green font-bold uppercase tracking-wider">Total Earned (Pending+Claimed)</p>
                        <p className="text-3xl font-black text-pop-black">{formatSui(totalEarnedCombined)} SUI</p>
                        <p className="text-xs font-bold text-gray-500 mt-1">Pending: {formatSui(totalPending)} / Claimed: {formatSui(totalClaimed)}</p>
                    </div>
                    <div className="bg-pop-pink/10 p-6 rounded-xl border-2 border-pop-pink shadow-[4px_4px_0px_0px_#FF6B6B]">
                        <p className="text-sm text-pop-pink font-bold uppercase tracking-wider">Rumors Joined</p>
                        <p className="text-3xl font-black text-pop-black">{participantStats?.joins ?? summary.count}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white p-5 rounded-xl border-2 border-pop-yellow shadow-[4px_4px_0px_0px_#F9D923]">
                        <p className="text-sm font-bold text-pop-black uppercase tracking-wider">Creator α Earnings</p>
                        <p className="text-3xl font-black text-pop-black">{formatSui(creatorStats?.alphaEarned ?? 0n)} SUI</p>
                        <p className="text-xs font-bold text-gray-500 mt-1">Joins to your rumors: {creatorStats?.joinCount ?? 0}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border-2 border-pop-blue shadow-[4px_4px_0px_0px_#4D96FF]">
                        <p className="text-sm font-bold text-pop-black uppercase tracking-wider">Participant Claimed</p>
                        <p className="text-3xl font-black text-pop-black">{formatSui(totalClaimed)} SUI</p>
                        <p className="text-xs font-bold text-gray-500 mt-1">Event-based totals (β already withdrawn)</p>
                    </div>
                </div>
            </Card>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-pop-black pl-2 border-l-8 border-pop-yellow">Participated Rumors</h2>
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching || isPending}>
                    {isFetching ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>
            {error && (
                <Card className="bg-pop-pink/10 border-pop-pink text-pop-black font-bold mb-4">
                    {error}
                </Card>
            )}
            {isLoading && <Card className="bg-white"><p className="font-bold text-pop-black">Loading tickets...</p></Card>}
            {!isLoading && tickets?.length === 0 && (
                <Card className="bg-white">
                    <p className="font-bold text-pop-black">No tickets yet.</p>
                </Card>
            )}
            <div className="space-y-4">
                {tickets?.map(({ ticket, rumor }, index) => {
                    const reward = rewardAmount(rumor, ticket);
                    return (
                        <div key={ticket.id} className="animate-bounce-in" style={{ animationDelay: `${index * 100}ms` }}>
                            <Card className="flex flex-col md:flex-row justify-between items-center p-6 hover:-translate-y-1 transition-transform">
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
                                            <p className="text-xs font-bold text-gray-500 uppercase">Claimable Reward</p>
                                            <p className="text-xl font-black text-pop-green">{formatSui(reward)} SUI</p>
                                        </div>
                                    )}

                                    {reward > 0n ? (
                                        <Button variant="primary" size="sm" className="bg-pop-green hover:bg-green-400" disabled={isPending} onClick={() => handleClaim(rumor.id, ticket.id)}>
                                            Claim
                                        </Button>
                                    ) : (
                                        <Link to={`/rumor/${rumor.id}`}>
                                            <Button variant="outline" size="sm">
                                                View
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Profile;
