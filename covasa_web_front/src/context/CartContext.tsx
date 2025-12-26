import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type CartItem = {
  productId: number;
  name: string;
  description: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  image?: string;
};

type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  addItems: (items: CartItem[]) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = 'covasa_cart';

const readStorage = (): CartItem[] => {
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
    return parsed.filter((item) => item && typeof item.productId === 'number');
  } catch {
    return [];
  }
};

const mergeItems = (current: CartItem[], incoming: CartItem[]) => {
  const map = new Map<number, CartItem>();
  current.forEach((item) => map.set(item.productId, { ...item }));

  incoming.forEach((item) => {
    const existing = map.get(item.productId);
    if (existing) {
      map.set(item.productId, {
        ...existing,
        ...item,
        quantity: existing.quantity + item.quantity,
      });
    } else {
      map.set(item.productId, { ...item });
    }
  });

  return Array.from(map.values());
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => readStorage());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const addItems = (incoming: CartItem[]) => {
    if (incoming.length === 0) {
      return;
    }
    setItems((prev) => mergeItems(prev, incoming));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, Math.floor(quantity) || 1) }
          : item,
      ),
    );
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const value = useMemo(
    () => ({
      items,
      totalQuantity,
      addItems,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, totalQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
