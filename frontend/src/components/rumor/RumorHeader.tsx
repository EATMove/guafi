import React from 'react';
import { StatusBadge } from '../StatusBadge';
import type { RumorView } from '../../lib/types';

interface Props {
    rumor: RumorView;
}

export const RumorHeader: React.FC<Props> = ({ rumor }) => {
    return (
        <div className="bg-pop-yellow/20 p-8 border-b-4 border-pop-black">
            <div className="flex justify-between items-center mb-4">
                <StatusBadge status={rumor.status} className="text-sm" />
                <span className="text-pop-black font-mono font-bold text-sm bg-white px-2 py-1 border border-pop-black rounded">
                    ID: {rumor.id.slice(0, 6)}...{rumor.id.slice(-4)}
                </span>
            </div>
            <h1 className="text-4xl font-black text-pop-black leading-tight break-words mb-4">
                {rumor.title}
            </h1>
            <div className="flex items-center justify-between text-sm font-bold text-gray-600">
                <span>Creator: {rumor.creator.slice(0, 6)}...{rumor.creator.slice(-4)}</span>
                <span>Blob: {rumor.blobId.slice(0, 8)}...</span>
            </div>
        </div>
    );
};

