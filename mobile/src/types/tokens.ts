export interface Token {
  id: string;
  code: string;
  name: string;
  issuer?: string;
  icon?: string;
  decimals: number;
  isDefault: boolean;
}

export interface TokenRate {
  tokenId: string;
  usdRate: number;
  updatedAt: string;
}

export const SUPPORTED_TOKENS: Token[] = [
  { id: 'native', code: 'XLM', name: 'Lumens', decimals: 7, isDefault: true },
  { id: 'USDC', code: 'USDC', name: 'USD Coin', issuer: 'GA7ZRFG7SD4TNWK5CF4J2FJ2TIXKF6LRK2VF2VFZIS的林e', decimals: 7, isDefault: false },
];

export const DEFAULT_RATES: Record<string, number> = {
  native: 0.11,
  USDC: 1.0,
};