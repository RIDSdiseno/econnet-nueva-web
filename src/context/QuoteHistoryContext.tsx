import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type QuoteSummary = {
  id: string;
  codigo?: string | null;
  total: number;
  estado?: string | null;
  createdAt?: string | null;
  nombreContacto?: string | null;
  itemsCount?: number | null;
};

type QuoteHistoryContextValue = {
  quotes: QuoteSummary[];
  upsertQuote: (quote: QuoteSummary) => void;
  removeQuote: (id: string) => void;
  clearQuotes: () => void;
};

const STORAGE_KEY = 'covasa_quotes';

const readStorage = (): QuoteSummary[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return null;
        }
        const rawId = (item as { id?: unknown }).id;
        const normalizedId = typeof rawId === 'string' ? rawId.trim() : '';
        if (!normalizedId) {
          return null;
        }
        return { ...(item as QuoteSummary), id: normalizedId };
      })
      .filter((item): item is QuoteSummary => Boolean(item));
  } catch {
    return [];
  }
};

const QuoteHistoryContext = createContext<QuoteHistoryContextValue | undefined>(undefined);

export const QuoteHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [quotes, setQuotes] = useState<QuoteSummary[]>(() => readStorage());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  }, [quotes]);

  // Keep callbacks stable to avoid triggering effect loops in consumers.
  const upsertQuote = useCallback((quote: QuoteSummary) => {
    if (!quote.id) {
      return;
    }
    setQuotes((prev) => [quote, ...prev.filter((item) => item.id !== quote.id)]);
  }, []);

  const removeQuote = useCallback((id: string) => {
    setQuotes((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearQuotes = useCallback(() => setQuotes([]), []);

  const value = useMemo(
    () => ({
      quotes,
      upsertQuote,
      removeQuote,
      clearQuotes,
    }),
    [quotes, upsertQuote, removeQuote, clearQuotes],
  );

  return <QuoteHistoryContext.Provider value={value}>{children}</QuoteHistoryContext.Provider>;
};

export const useQuoteHistory = () => {
  const context = useContext(QuoteHistoryContext);
  if (!context) {
    throw new Error('useQuoteHistory must be used within QuoteHistoryProvider');
  }
  return context;
};
