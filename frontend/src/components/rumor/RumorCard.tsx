import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { StatusBadge } from '../StatusBadge';
import { readablePrice } from '../../lib/rumorParse';
import type { RumorView } from '../../lib/types';

interface Props {
    rumor: RumorView;
}

export const RumorCard: React.FC<Props> = ({ rumor }) => {
    const progress = rumor.minParticipants === 0 
        ? 0 
        : Math.min((rumor.participants / rumor.minParticipants) * 100, 100);

    return (
        <Link to={`/rumor/${rumor.id}`} className="block group h-full">
            <Card className="h-full transition-transform group-hover:-translate-y-1 group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <StatusBadge status={rumor.status} />
                    <span className="font-black text-pop-blue text-lg">{readablePrice(rumor)}</span>
                </div>
                
                <h3 className="text-2xl font-black text-pop-black mb-2 line-clamp-2 flex-grow group-hover:text-pop-blue transition-colors">
                    {rumor.title}
                </h3>
                
                <p className="text-sm text-gray-500 font-bold mb-4">
                    By {rumor.creator.slice(0, 6)}...{rumor.creator.slice(-4)}
                </p>

                <div className="mt-auto">
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{rumor.participants}/{rumor.minParticipants}</span>
                    </div>
                    <div className="w-full bg-gray-100 border-2 border-pop-black rounded-full h-3 p-[1px]">
                        <div 
                            className={`h-full rounded-full border border-pop-black ${
                                rumor.status === 'unlocked' ? 'bg-pop-green' : 'bg-pop-blue'
                            }`} 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </Card>
        </Link>
    );
};

