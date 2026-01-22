import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type CartItem = {
  productId: string;
  varianteId?: string; // Nuevo: ID de variante (opcional)
  name: string;
  description: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  image?: string;
};

// Genera una clave única para identificar items (producto + variante)
const getItemKey = (productId: string, varianteId?: string) =>
  varianteId ? `${productId}::${varianteId}` : productId;

type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  addItems: (items: CartItem[]) => void;
  updateQuantity: (productId: string, quantity: number, varianteId?: string) => void;
  removeItem: (productId: string, varianteId?: string) => void;
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
    return parsed
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return null;
        }
        const rawId = (item as { productId?: unknown }).productId;
        const normalizedId =
          typeof rawId === 'number' ? String(rawId) : typeof rawId === 'string' ? rawId.trim() : '';
        if (!normalizedId) {
          return null;
        }
        return { ...(item as CartItem), productId: normalizedId };
      })
      .filter((item): item is CartItem => Boolean(item));
  } catch {
    return [];
  }
};

const mergeItems = (current: CartItem[], incoming: CartItem[]) => {
  const map = new Map<string, CartItem>();
  // Usar clave compuesta: productId + varianteId
  current.forEach((item) => {
    const key = getItemKey(item.productId, item.varianteId);
    map.set(key, { ...item });
  });

  incoming.forEach((item) => {
    const key = getItemKey(item.productId, item.varianteId);
    const existing = map.get(key);
    if (existing) {
      map.set(key, {
        ...existing,
        ...item,
        quantity: existing.quantity + item.quantity,
      });
    } else {
      map.set(key, { ...item });
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

  const updateQuantity = (productId: string, quantity: number, varianteId?: string) => {
    const targetKey = getItemKey(productId, varianteId);
    setItems((prev) =>
      prev.map((item) => {
        const itemKey = getItemKey(item.productId, item.varianteId);
        return itemKey === targetKey
          ? { ...item, quantity: Math.max(1, Math.floor(quantity) || 1) }
          : item;
      }),
    );
  };

  const removeItem = (productId: string, varianteId?: string) => {
    const targetKey = getItemKey(productId, varianteId);
    setItems((prev) => prev.filter((item) => {
      const itemKey = getItemKey(item.productId, item.varianteId);
      return itemKey !== targetKey;
    }));
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
