import React from 'react';
import { Button } from '../ui/Button';
import { readablePrice } from '../../lib/rumorParse';
import { formatSui } from '../../lib/format';
import type { RumorView } from '../../lib/types';

interface Props {
    rumor: RumorView;
    hasTicket: boolean;
    isCreator: boolean;
    isPending: boolean;
    onJoin: () => void;
    error?: string | null;
}

export const JoinPanel: React.FC<Props> = ({ 
    rumor, hasTicket, isCreator, isPending, onJoin, error 
}) => {
    if (error) {
        return <div className="bg-pop-pink/10 border-2 border-pop-pink p-3 font-bold text-pop-black">Error: {error}</div>;
    }

    if (hasTicket) {
        return (
            <div className="bg-pop-green/20 p-4 rounded-xl border-2 border-pop-green text-center font-bold text-pop-green">
                You hold a valid Ticket for this Rumor !
            </div>
        );
    }

    if (isCreator || rumor.status === 'failed') return null;

    return (
        <div className="bg-pop-blue/10 p-6 rounded-xl border-2 border-pop-blue shadow-hard">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <p className="text-sm font-bold text-pop-blue uppercase">Entry Price</p>
                    <p className="text-4xl font-black text-pop-black">{readablePrice(rumor)}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-gray-500">Reward Pool</p>
                    <p className="text-xl font-bold text-pop-green">{formatSui(rumor.rewardPool)} SUI</p>
                </div>
            </div>
            <Button onClick={onJoin} disabled={isPending} size="lg" className="w-full text-xl py-4">
                {isPending ? 'Processing...' : 'Pay to Join & Earn'}
            </Button>
            <p className="text-xs text-center mt-3 text-gray-500 font-bold">
                * 50% of future entry fees will be distributed to you!
            </p>
        </div>
    );
};

