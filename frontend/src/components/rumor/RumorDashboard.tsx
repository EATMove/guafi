import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '../StatusBadge';
import { formatSui } from '../../lib/format';
import type { RumorView } from '../../lib/types';

interface Props {
    rumor: RumorView;
}

export const RumorDashboard: React.FC<Props> = ({ rumor }) => {
    const { t } = useTranslation();
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
                        {t('dashboard.id')}: {rumor.id.slice(0, 6)}...{rumor.id.slice(-4)}
                    </span>
                </div>
                <div className="text-sm font-bold text-gray-600">
                    {t('dashboard.by')} <span className="text-pop-black">{rumor.creator.slice(0, 6)}...</span>
                </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black text-pop-black leading-tight mb-4 break-words">
                {rumor.title}
            </h1>

            {/* Description */}
            {rumor.description && (
                <div className="bg-white border-2 border-pop-black p-6 rounded-lg shadow-hard-sm mb-8 transform max-w-2xl">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">📝</span>
                        <p className="text-lg font-bold text-gray-700 leading-relaxed">
                            {rumor.description}
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-xl border-2 border-pop-black p-6 shadow-sm">
                {/* Progress Column */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold text-gray-500">
                        <span>{t('dashboard.unlock_progress')}</span>
                        <span className="text-pop-black">{rumor.participants} / {rumor.minParticipants}</span>
                    </div>
                    <div className="w-full bg-gray-100 border-2 border-pop-black rounded-full h-4 p-0.5">
                        <div
                            className={`h-full rounded-full border border-pop-black transition-all duration-500 ${rumor.status === 'unlocked' ? 'bg-pop-green' : 'bg-pop-blue'
                                }`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs font-bold text-gray-400">
                        {rumor.status === 'unlocked'
                            ? t('dashboard.content_unlocked')
                            : `${Math.max(rumor.minParticipants - rumor.participants, 0)} ${t('dashboard.more_needed')}`}
                    </p>
                </div>

                {/* Entry Price Column */}
                <div className="flex flex-col justify-center items-start md:items-center border-t-2 md:border-t-0 md:border-l-2 border-dashed border-gray-300 pt-4 md:pt-0 md:pl-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('dashboard.entry_price')}</p>
                    <p className="text-3xl font-black text-pop-black">{formatSui(rumor.price)} <span className="text-sm text-gray-400">SUI</span></p>
                </div>

                {/* Reward Pool Column */}
                <div className="flex flex-col justify-center items-start md:items-center border-t-2 md:border-t-0 md:border-l-2 border-dashed border-gray-300 pt-4 md:pt-0 md:pl-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('dashboard.total_reward_pool')}</p>
                    <p className="text-3xl font-black text-pop-green">{formatSui(rumor.rewardPool)} <span className="text-sm text-gray-400">SUI</span></p>
                </div>
            </div>
        </div>
    );
};


