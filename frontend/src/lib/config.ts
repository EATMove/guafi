const pkg = import.meta.env.VITE_PACKAGE_ID as string | undefined;
const configId = import.meta.env.VITE_CONFIG_ID as string | undefined;
const network = (import.meta.env.VITE_SUI_NETWORK as string | undefined) || 'testnet';

export const guafiConfig = {
    packageId: pkg,
    configId,
    network: network as 'testnet' | 'mainnet',
};
