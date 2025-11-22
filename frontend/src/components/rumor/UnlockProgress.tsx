import React from 'react';
import type { RumorView } from '../../lib/types';

interface Props {
    rumor: RumorView;
}

export const UnlockProgress: React.FC<Props> = ({ rumor }) => {
    const progress = rumor.minParticipants === 0 
        ? 0 
        : Math.min((rumor.participants / rumor.minParticipants) * 100, 100);

    return (
        <div className="bg-white p-6 border-2 border-pop-black shadow-hard rounded-xl">
            <div className="flex justify-between text-lg font-bold text-pop-black mb-4">
                <span>Unlock Progress</span>
                <span>{rumor.participants} / {rumor.minParticipants}</span>
            </div>
            <div className="w-full bg-gray-100 border-2 border-pop-black rounded-full h-6 p-0.5">
                <div
                    className={`h-full rounded-full border border-pop-black transition-all duration-500 ${
                        rumor.status === 'unlocked' ? 'bg-pop-green' : 'bg-pop-blue'
                    }`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-sm font-bold text-gray-500 mt-2 text-right">
                {rumor.status === 'unlocked' 
                    ? '🎉 Unlocked! Content is available.' 
                    : `${Math.max(rumor.minParticipants - rumor.participants, 0)} more needed.`}
            </p>
        </div>
    );
};

