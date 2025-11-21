import React from 'react';
import type { EventId } from '@mysten/sui/client';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSuiClient } from '@mysten/dapp-kit';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { describeStatus, parseRumor, readablePrice } from '../lib/rumorClient';
import { guafiConfig } from '../lib/config';
import type { RumorView } from '../lib/types';
import { shortAddress } from '../lib/format';

const RumorList: React.FC = () => {
    const client = useSuiClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['rumors', guafiConfig.packageId],
        enabled: Boolean(guafiConfig.packageId),
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        queryFn: async (): Promise<RumorView[]> => {
            if (!guafiConfig.packageId) throw new Error('Missing VITE_PACKAGE_ID');
            const eventType = `${guafiConfig.packageId}::guafi::RumorCreated`;
            const ids: string[] = [];
            const seen = new Set<string>();
            let cursor: EventId | null = null;

            // Paginate to avoid silently dropping older rumors; cap total to avoid runaway
            const PAGE_SIZE = 50;
            const MAX_EVENTS = 200;

            do {
                const events = await client.queryEvents({
                    query: { MoveEventType: eventType },
                    limit: PAGE_SIZE,
                    cursor: cursor ?? undefined,
                });

                events.data.forEach((evt) => {
                    const parsed = evt.parsedJson as Record<string, unknown> | null;
                    const rumorId = parsed?.rumor_id;
                    if (typeof rumorId === 'string' && !seen.has(rumorId)) {
                        seen.add(rumorId);
                        ids.push(rumorId);
                    }
                });

                cursor = events.hasNextPage ? events.nextCursor ?? null : null;
            } while (cursor && ids.length < MAX_EVENTS);

            if (ids.length === 0) return [];

            const objects = await client.multiGetObjects({
                ids,
                options: { showContent: true },
            });

            const validObjects = objects.filter((obj) => obj.data && !obj.error);

            return validObjects.map(parseRumor).filter(Boolean) as RumorView[];
        },
    });

    const rumors = data ?? [];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-black text-pop-black drop-shadow-md">Latest Rumors</h1>
                <Link to="/create">
                    <Button variant="primary" size="lg" className="animate-bounce-in">
                        + Post New Rumor
                    </Button>
                </Link>
            </div>

            {!guafiConfig.packageId && (
                <Card className="bg-pop-pink/10 border-pop-pink text-pop-black font-bold">
                    Set VITE_PACKAGE_ID in .env (no deployed package detected).
                </Card>
            )}

            {error && (
                <Card className="bg-pop-pink/10 border-pop-pink text-pop-black font-bold">
                    Failed to read on-chain data: {(error as Error).message}
                </Card>
            )}

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {isLoading && <p className="font-bold text-pop-black">Loading rumors from testnet...</p>}
                {!isLoading && rumors.length === 0 && (
                    <Card className="bg-white">
                        <p className="font-bold text-pop-black">No rumors on-chain yet—create one to start.</p>
                    </Card>
                )}

                {rumors.map((rumor, index) => (
                    <div key={rumor.id} className="animate-bounce-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <Card className="h-full flex flex-col hover:-translate-y-2 transition-transform duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 border-2 border-pop-black font-bold uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${rumor.status === 'unlocked' ? 'bg-pop-green text-white' :
                                        rumor.status === 'failed' ? 'bg-pop-pink text-white' :
                                            'bg-pop-yellow text-pop-black'
                                    }`}>
                                    {describeStatus(rumor.status)}
                                </span>
                                <div className="text-right">
                                    <span className="text-gray-500 font-mono font-bold text-xs truncate max-w-[140px]">{shortAddress(rumor.id)}</span>
                                </div>
                            </div>

                            <h2 className="text-2xl font-black mb-4 text-pop-black leading-tight break-words">{rumor.title}</h2>

                            <div className="mt-auto space-y-4">
                                <div className="space-y-2 font-bold">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Price:</span>
                                        <span className="bg-pop-blue text-white px-2 border border-pop-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{readablePrice(rumor)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Participants:</span>
                                        <span>{rumor.participants} / {rumor.minParticipants}</span>
                                    </div>
                                </div>

                                <div className="w-full bg-white border-2 border-pop-black h-4 rounded-full overflow-hidden p-0.5">
                                    <div
                                        className={`h-full rounded-full border border-pop-black ${rumor.status === 'unlocked' ? 'bg-pop-green' : 'bg-pop-blue'
                                            }`}
                                        style={{ width: `${rumor.minParticipants === 0 ? 0 : Math.min((rumor.participants / rumor.minParticipants) * 100, 100)}%` }}
                                    ></div>
                                </div>

                                <Link to={`/rumor/${rumor.id}`} className="block">
                                    <Button variant="outline" className="w-full">
                                        View Details
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RumorList;
