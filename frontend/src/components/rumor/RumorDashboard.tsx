import React from 'react';
import { StatusBadge } from '../StatusBadge';
import { formatSui } from '../../lib/format';
import type { RumorView } from '../../lib/types';

interface Props {
    rumor: RumorView;
}

export const RumorDashboard: React.FC<Props> = ({ rumor }) => {
    const progress = rumor.minParticipants === 0 
        ? 0 
        : Math.min((rumor.participants / rumor.minParticipants) * 100, 100);


    return (
        <div className="bg-white border-b-4 border-pop-black p-8 bg-pop-yellow/10">
            {/* Top Meta */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <StatusBadge status={rumor.status} />
                    <span className="text-xs font-bold text-gray-500 font-mono bg-white px-2 py-1 border border-gray-300 rounded">
                        ID: {rumor.id.slice(0, 6)}...{rumor.id.slice(-4)}
                    </span>
                </div>
                <div className="text-sm font-bold text-gray-600">
                    By <span className="text-pop-black">{rumor.creator.slice(0, 6)}...</span>
                </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black text-pop-black leading-tight mb-8 break-words">
                {rumor.title}
            </h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-xl border-2 border-pop-black p-6 shadow-sm">
                {/* Progress Column */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold text-gray-500">
                        <span>Unlock Progress</span>
                        <span className="text-pop-black">{rumor.participants} / {rumor.minParticipants}</span>
                    </div>
                    <div className="w-full bg-gray-100 border-2 border-pop-black rounded-full h-4 p-0.5">
                        <div
                            className={`h-full rounded-full border border-pop-black transition-all duration-500 ${
                                rumor.status === 'unlocked' ? 'bg-pop-green' : 'bg-pop-blue'
                            }`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs font-bold text-gray-400">
                        {rumor.status === 'unlocked' 
                            ? '✨ Content Unlocked' 
                            : `${Math.max(rumor.minParticipants - rumor.participants, 0)} more needed`}
                    </p>
                </div>

                {/* Financials Column */}
                <div className="flex flex-col justify-center border-t-2 md:border-t-0 md:border-l-2 border-gray-100 pt-4 md:pt-0 md:pl-6 space-y-3">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Entry Price</p>
                        <p className="text-lg font-black text-pop-black">{formatSui(rumor.price)} SUI</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reward Pool</p>
                        <p className="text-xl font-black text-pop-green">{formatSui(rumor.rewardPool)} SUI</p>
                    </div>
                </div>

                {/* My Stats / CTA Column */}
                <div className="flex flex-col justify-center border-t-2 md:border-t-0 md:border-l-2 border-gray-100 pt-4 md:pt-0 md:pl-6">  
                        <div className="text-sm text-gray-500">
                            <p className="font-medium">Join now to earn <span className="font-bold text-pop-green">50%</span> of future entry fees!</p>
                            <p className="text-xs mt-2 text-gray-400">Early participants earn more.</p>
                        </div>
                </div>
            </div>
        </div>
    );
};


