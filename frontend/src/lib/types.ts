export type RumorStatus = 'pending' | 'unlocked' | 'failed';

export interface RumorView {
    id: string;
    title: string;
    description: string;
    blobId: string;
    price: bigint;
    minParticipants: number;
    participants: number;
    deadline: number;
    status: RumorStatus;
    creator: string;
    rewardPool: bigint;
    principal: bigint;
    accRewardPerShare: bigint;
}

export interface TicketView {
    id: string;
    rumorId: string;
    rewardDebt: bigint;
}
