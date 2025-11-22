import type { EventId, SuiClient } from '@mysten/sui/client';

const BASIS_POINTS = 10_000n;
const ALPHA = 4_000n; // 40% creator share

type RumorCreatedEvent = {
    rumor_id: string;
    creator: string;
    price: string;
};

type RumorJoinedEvent = {
    rumor_id: string;
    participant: string;
};

type RewardClaimedEvent = {
    rumor_id: string;
    participant: string;
    amount: string;
};

async function listEvents<T>(
    client: SuiClient,
    eventType: string,
    limit = 200,
    maxPages = 20
): Promise<T[]> {
    const out: T[] = [];
    let cursor: EventId | null = null;
    let pages = 0;
    do {
        const typedCursor = cursor ?? undefined;
        const res = await client.queryEvents({
            query: { MoveEventType: eventType },
            cursor: typedCursor,
            limit,
        });
        res.data.forEach((evt) => {
            if (evt.parsedJson) {
                out.push(evt.parsedJson as T);
            }
        });
        cursor = res.hasNextPage ? (res.nextCursor as EventId | null) : null;
        pages += 1;
    } while (cursor && pages < maxPages);
    return out;
}

function toBig(raw: string | number | bigint): bigint {
    if (typeof raw === 'bigint') return raw;
    if (typeof raw === 'number') return BigInt(Math.trunc(raw));
    return BigInt(raw);
}

export async function computeCreatorAlpha(
    client: SuiClient,
    packageId: string,
    creator: string,
    opts?: { pageLimit?: number; pages?: number }
): Promise<{ alphaEarned: bigint; joinCount: number }> {
    const pageLimit = opts?.pageLimit ?? 200;
    const pages = opts?.pages ?? 20;
    const created = await listEvents<RumorCreatedEvent>(
        client,
        `${packageId}::guafi::RumorCreated`,
        pageLimit,
        pages
    );
    const joins = await listEvents<RumorJoinedEvent>(
        client,
        `${packageId}::guafi::RumorJoined`,
        pageLimit,
        pages
    );

    const myRumors = new Map<string, bigint>(); // rumor_id -> price
    created.forEach((evt) => {
        if (evt.creator.toLowerCase() === creator.toLowerCase()) {
            myRumors.set(evt.rumor_id, toBig(evt.price));
        }
    });

    let alpha = 0n;
    let count = 0;
    joins.forEach((evt) => {
        const price = myRumors.get(evt.rumor_id);
        if (price !== undefined) {
            alpha += (price * ALPHA) / BASIS_POINTS;
            count += 1;
        }
    });

    return { alphaEarned: alpha, joinCount: count };
}

export async function computeParticipantStats(
    client: SuiClient,
    packageId: string,
    participant: string,
    opts?: { pageLimit?: number; pages?: number }
): Promise<{ spent: bigint; claimed: bigint; joins: number }> {
    const pageLimit = opts?.pageLimit ?? 200;
    const pages = opts?.pages ?? 20;
    const created = await listEvents<RumorCreatedEvent>(
        client,
        `${packageId}::guafi::RumorCreated`,
        pageLimit,
        pages
    );
    const priceIndex = new Map<string, bigint>();
    created.forEach((evt) => {
        priceIndex.set(evt.rumor_id, toBig(evt.price));
    });

    const joins = await listEvents<RumorJoinedEvent>(
        client,
        `${packageId}::guafi::RumorJoined`,
        pageLimit,
        pages
    );
    let spent = 0n;
    let joinCount = 0;
    joins.forEach((evt) => {
        if (evt.participant.toLowerCase() === participant.toLowerCase()) {
            const price = priceIndex.get(evt.rumor_id) ?? 0n;
            spent += price;
            joinCount += 1;
        }
    });

    const claimedEvents = await listEvents<RewardClaimedEvent>(
        client,
        `${packageId}::guafi::RewardClaimed`,
        pageLimit,
        pages
    );
    let claimed = 0n;
    claimedEvents.forEach((evt) => {
        if (evt.participant.toLowerCase() === participant.toLowerCase()) {
            claimed += toBig(evt.amount);
        }
    });

    return { spent, claimed, joins: joinCount };
}

export async function computeUserStats(
    client: SuiClient,
    packageId: string,
    user: string,
    opts?: { pageLimit?: number; pages?: number }
): Promise<{
    creator: { alphaEarned: bigint; joinCount: number };
    participant: { spent: bigint; claimed: bigint; joins: number };
}> {
    const pageLimit = opts?.pageLimit ?? 200;
    const pages = opts?.pages ?? 20;

    const created = await listEvents<RumorCreatedEvent>(
        client,
        `${packageId}::guafi::RumorCreated`,
        pageLimit,
        pages
    );
    const joined = await listEvents<RumorJoinedEvent>(
        client,
        `${packageId}::guafi::RumorJoined`,
        pageLimit,
        pages
    );
    const claimedEvents = await listEvents<RewardClaimedEvent>(
        client,
        `${packageId}::guafi::RewardClaimed`,
        pageLimit,
        pages
    );

    // creator stats
    const myRumors = new Map<string, bigint>();
    created.forEach((evt) => {
        if (evt.creator.toLowerCase() == user.toLowerCase()) {
            myRumors.set(evt.rumor_id, toBig(evt.price));
        }
    });
    let alphaEarned = 0n;
    let creatorJoinCount = 0;
    joined.forEach((evt) => {
        const price = myRumors.get(evt.rumor_id);
        if (price !== undefined) {
            alphaEarned += (price * ALPHA) / BASIS_POINTS;
            creatorJoinCount += 1;
        }
    });

    // participant stats
    const priceIndex = new Map<string, bigint>();
    created.forEach((evt) => {
        priceIndex.set(evt.rumor_id, toBig(evt.price));
    });
    let spent = 0n;
    let joins = 0;
    joined.forEach((evt) => {
        if (evt.participant.toLowerCase() == user.toLowerCase()) {
            spent += priceIndex.get(evt.rumor_id) ?? 0n;
            joins += 1;
        }
    });
    let claimed = 0n;
    claimedEvents.forEach((evt) => {
        if (evt.participant.toLowerCase() == user.toLowerCase()) {
            claimed += toBig(evt.amount);
        }
    });

    return {
        creator: { alphaEarned, joinCount: creatorJoinCount },
        participant: { spent, claimed, joins },
    };
}
