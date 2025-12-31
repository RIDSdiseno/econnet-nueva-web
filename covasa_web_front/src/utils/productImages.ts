import type { Product } from '../data/products';

export const getProductImages = (product: Product): string[] => {
  const sources = [...(product.images ?? []), product.image ?? ''];
  const seen = new Set<string>();

  return sources
    .map((value) => (value ?? '').trim())
    .filter((value): value is string => Boolean(value))
    .filter((value) => {
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
};
