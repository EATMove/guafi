import type { SuiMoveObject, SuiObjectResponse } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { guafiConfig } from './config';
import { formatSui, toMist } from './format';
import type { RumorStatus, RumorView, TicketView } from './types';

const REWARD_PRECISION = 1_000_000_000_000n;

export function parseRumor(obj: SuiObjectResponse): RumorView | null {
    if (!obj.data || obj.data.content?.dataType !== 'moveObject') return null;
    const fields = (obj.data.content as SuiMoveObject).fields as Record<string, unknown>;
    if (!fields) return null;

    const statusNum = Number(fields.status);
    const status: RumorStatus =
        statusNum === 1 ? 'unlocked' : statusNum === 2 ? 'failed' : 'pending';

    const rewardPoolRaw = fields.reward_pool as { fields?: { value?: string } } | undefined;
    const principalRaw = fields.principal_vault as { fields?: { value?: string } } | undefined;

    return {
        id: obj.data.objectId,
        blobId: fields.blob_id as string,
        price: BigInt(fields.price as string),
        minParticipants: Number(fields.min_participants),
        participants: Number(fields.participants_count),
        deadline: Number(fields.deadline),
        status,
        creator: fields.creator as string,
        rewardPool: BigInt((rewardPoolRaw?.fields?.value as string | undefined) ?? '0'),
        principal: BigInt((principalRaw?.fields?.value as string | undefined) ?? '0'),
        accRewardPerShare: BigInt(fields.acc_reward_per_share as string),
    };
}

export function parseTicket(obj: SuiObjectResponse): TicketView | null {
    if (!obj.data || obj.data.content?.dataType !== 'moveObject') return null;
    const fields = (obj.data.content as SuiMoveObject).fields as Record<string, unknown>;
    if (!fields) return null;
    return {
        id: obj.data.objectId,
        rumorId: fields.rumor_id as string,
        rewardDebt: BigInt(fields.reward_debt as string),
    };
}

export function rewardAmount(rumor: RumorView, ticket: TicketView): bigint {
    if (rumor.status !== 'unlocked') return 0n;
    const pending = rumor.accRewardPerShare - ticket.rewardDebt;
    if (pending <= 0) return 0n;
    const amount = pending / REWARD_PRECISION;
    return amount < rumor.rewardPool ? amount : rumor.rewardPool;
}

export function buildCreateRumorTx(params: {
    blobId: string;
    price: number;
    minParticipants: number;
    deadlineMs?: number;
}) {
    if (!guafiConfig.packageId) throw new Error('VITE_PACKAGE_ID missing');
    const tx = new Transaction();
    const priceMist = toMist(params.price);

    tx.moveCall({
        target: `${guafiConfig.packageId}::guafi::create_rumor`,
        arguments: [
            tx.pure.string(params.blobId),
            tx.pure.u64(priceMist),
            tx.pure.u64(params.minParticipants),
            tx.pure.u64(params.deadlineMs ?? 0),
            tx.object('0x6'), // Clock
        ],
    });

    return tx;
}

export function buildJoinRumorTx(rumorId: string, priceMist: bigint) {
    if (!guafiConfig.packageId || !guafiConfig.configId) {
        throw new Error('VITE_PACKAGE_ID or VITE_CONFIG_ID missing');
    }

    const tx = new Transaction();
    const payment = tx.splitCoins(tx.gas, [tx.pure.u64(priceMist)]);

    tx.moveCall({
        target: `${guafiConfig.packageId}::guafi::join_rumor`,
        arguments: [tx.object(rumorId), tx.object(guafiConfig.configId), payment, tx.object('0x6')],
    });

    return tx;
}

export function buildClaimRewardTx(rumorId: string, ticketId: string) {
    if (!guafiConfig.packageId) throw new Error('VITE_PACKAGE_ID missing');
    const tx = new Transaction();

    tx.moveCall({
        target: `${guafiConfig.packageId}::guafi::claim_reward`,
        arguments: [tx.object(rumorId), tx.object(ticketId)],
    });

    return tx;
}

export function describeStatus(status: RumorStatus) {
    if (status === 'unlocked') return 'Unlocked';
    if (status === 'failed') return 'Failed';
    return 'Pending';
}

export function readablePrice(rumor: RumorView) {
    return `${formatSui(rumor.price)} SUI`;
}
