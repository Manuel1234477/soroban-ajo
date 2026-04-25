import { create } from 'zustand';
import { SUPPORTED_TOKENS, DEFAULT_RATES, type Token, type TokenRate } from '../types/tokens';

interface TokenState {
  tokens: Token[];
  rates: Record<string, number>;
  selectedTokenId: string;
  isLoading: boolean;

  setSelectedToken: (tokenId: string) => void;
  setRates: (rates: Record<string, number>) => void;
  convertAmount: (amount: number, fromTokenId: string, toTokenId: string) => number;
  getUsdValue: (amount: number, tokenId: string) => number;
}

export const useTokenStore = create<TokenState>((set, get) => ({
  tokens: SUPPORTED_TOKENS,
  rates: DEFAULT_RATES,
  selectedTokenId: 'native',
  isLoading: false,

  setSelectedToken: (tokenId) => set({ selectedTokenId: tokenId }),

  setRates: (rates) => set({ rates: { ...get().rates, ...rates } }),

  convertAmount: (amount, fromTokenId, toTokenId) => {
    const { rates } = get();
    const fromRate = rates[fromTokenId] ?? 1;
    const toRate = rates[toTokenId] ?? 1;
    const usdValue = amount * fromRate;
    return usdValue / toRate;
  },

  getUsdValue: (amount, tokenId) => {
    const { rates } = get();
    return amount * (rates[tokenId] ?? 1);
  },
}));