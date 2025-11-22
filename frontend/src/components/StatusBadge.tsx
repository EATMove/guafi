import React from 'react';
import { describeStatus } from '../lib/rumorClient';
import type { RumorStatus } from '../lib/types';

interface Props {
    status: RumorStatus;
    className?: string;
}

export const StatusBadge: React.FC<Props> = ({ status, className = '' }) => {
    const colors = {
        unlocked: 'bg-pop-green text-white',
        failed: 'bg-pop-pink text-white',
        pending: 'bg-pop-yellow text-pop-black',
    };

    return (
        <span className={`px-3 py-1 border-2 border-pop-black font-bold uppercase text-xs shadow-hard-sm ${colors[status]} ${className}`}>
            {describeStatus(status)}
        </span>
    );
};

