const MIST_PER_SUI = 1_000_000_000n;

export function formatSui(amount: bigint | number | string, digits = 4): string {
    const value = typeof amount === 'bigint' ? amount : BigInt(amount);
    const safeDigits = Math.max(0, Math.min(digits, 9)); // Mist precision is 9 decimals
    const negative = value < 0n;
    const absValue = negative ? -value : value;

    const integerPart = absValue / MIST_PER_SUI;
    const remainder = absValue % MIST_PER_SUI;

    if (safeDigits === 0) {
        const carry = remainder >= MIST_PER_SUI / 2n ? 1n : 0n;
        const intWithCarry = integerPart + carry;
        return `${negative ? '-' : ''}${intWithCarry.toString()}`;
    }

    const factor = 10n ** BigInt(safeDigits);
    let fractionalRounded = (remainder * factor + MIST_PER_SUI / 2n) / MIST_PER_SUI;
    let carry = 0n;

    if (fractionalRounded >= factor) {
        carry = 1n;
        fractionalRounded -= factor;
    }

    const intWithCarry = integerPart + carry;
    const fractionalStr = fractionalRounded.toString().padStart(safeDigits, '0');
    return `${negative ? '-' : ''}${intWithCarry.toString()}.${fractionalStr}`;
}

export function toMist(input: string | number): bigint {
    const numeric = typeof input === 'number' ? input : Number(input);
    return BigInt(Math.floor(numeric * 1_000_000_000));
}
