import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { SealClient, SessionKey } from "@mysten/seal";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex } from "@mysten/sui/utils";
import { guafiConfig } from "../config";

const SUI_NETWORK = import.meta.env.VITE_SUI_NETWORK;
const suiClient = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK) });

// Seal 节点配置
const SERVER_OBJECT_IDS = [
    "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75", 
    "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
    "0x6068c0acb197dddbacd4746a9de7f025b2ed5a5b6c1b1ab44dade4426d141da2"
];

export const sealClient = new SealClient({
    suiClient,
    serverConfigs: SERVER_OBJECT_IDS.map((id) => ({
        objectId: id,
        weight: 1,
    })),
    verifyKeyServers: false,
});

// --- Session Key Cache ---
let cachedSessionKey: SessionKey | null = null;
let sessionKeyExpiry: number = 0;
let sessionKeyOwner: string = '';

async function getOrCreateSessionKey(
    currentAddress: string, 
    signMessage: (args: { message: Uint8Array }) => Promise<{ signature: string }>
): Promise<SessionKey> {
    const now = Date.now();
    
    // Check cache: exists, not expired (buffer 1min), and belongs to current user
    if (cachedSessionKey && 
        now < sessionKeyExpiry - 60000 && 
        sessionKeyOwner === currentAddress
    ) {
        return cachedSessionKey;
    }

    // Create new
    const ttlMin = 30; // Cache for 30 mins
    const sessionKey = await SessionKey.create({
        address: currentAddress,
        packageId: guafiConfig.packageId || "",
        ttlMin, 
        suiClient,
    });

    // Sign
    const message = sessionKey.getPersonalMessage();
    const { signature } = await signMessage({ message });
    sessionKey.setPersonalMessageSignature(signature);

    // Update cache
    cachedSessionKey = sessionKey;
    sessionKeyExpiry = now + (ttlMin * 60 * 1000);
    sessionKeyOwner = currentAddress;

    return sessionKey;
}

// --- 2. 加密功能 (用于 CreateRumor) ---

export async function encryptRumorContent(fileOrData: File) {
    if (!guafiConfig.packageId) throw new Error("Package ID not configured");

    let data: Uint8Array;

    const buffer = await fileOrData.arrayBuffer();
    data = new Uint8Array(buffer);
    
    // 调用 Seal 加密
    const { encryptedObject, key } = await sealClient.encrypt({
        threshold: 2, // 至少需要2个节点验证
        packageId: guafiConfig.packageId,
        id: guafiConfig.packageId, 
        data,
    });

    return {
        encryptedBytes: encryptedObject,
        backupKey: key // 创作者需要保存这个作为备份
    };
}

// --- 3. 解密功能 (用于 RumorDetail) ---

/**
 * 解密内容
 * @param encryptedData - 加密的字节数据 (Uint8Array)
 * @param rumorId - Rumor ID
 * @param ticketId - 用户的 Ticket ID
 * @param currentAddress - 当前用户地址
 * @param signMessage - 钱包签名回调函数 (来自 useSignPersonalMessage)
 */
export async function decryptRumorContent(
    encryptedData: Uint8Array,
    rumorId: string,
    ticketId: string,
    currentAddress: string,
    signMessage: (args: { message: Uint8Array }) => Promise<{ signature: string }>
): Promise<Uint8Array> { 
    if (!guafiConfig.packageId) throw new Error("Package ID not configured");

    // 3.1 获取或创建 Session Key (带缓存)
    const sessionKey = await getOrCreateSessionKey(currentAddress, signMessage);

    // 3.2 构建鉴权交易 
    const tx = new Transaction();
    tx.moveCall({
        target: `${guafiConfig.packageId}::guafi::seal_approve`,
        arguments: [
            tx.pure.vector('u8', fromHex(guafiConfig.packageId)),
            tx.object(rumorId),
            tx.object(ticketId),
        ],
    });

    // 生成交易字节码
    const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });

    // 3.3 调用 Seal 解密
    const decryptedBytes = await sealClient.decrypt({
        data: encryptedData,
        sessionKey,
        txBytes,
    });

    return decryptedBytes; 
}
