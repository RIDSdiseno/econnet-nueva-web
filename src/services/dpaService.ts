import { uiLogger } from '../utils/logger';
import { API_BASE_URL } from './api';

export type DpaRegion = string;
export type DpaComuna = string;

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  message?: string;
};

type CacheEntry<T> = {
  expiresAt: number;
  data: T;
};

type MemoryEntry<T> = {
  expiresAt: number;
  data?: T;
  promise?: Promise<T>;
};

const DPA_BASE_URL = `${API_BASE_URL}/dpa`;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas
const STORAGE_PREFIX = 'covasa_dpa_cache_v2';
const DEFAULT_ERROR_MESSAGE = 'No se pudo cargar regiones/comunas. Intenta nuevamente.';
const memoryCache = new Map<string, MemoryEntry<unknown>>();

const storageKey = (key: string) => `${STORAGE_PREFIX}:${key}`;

const readStorage = <T>(key: string): CacheEntry<T> | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(storageKey(key));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (!parsed || typeof parsed.expiresAt !== 'number') {
      window.localStorage.removeItem(storageKey(key));
      return null;
    }

    if (parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(storageKey(key));
      return null;
    }

    return parsed;
  } catch (error) {
    window.localStorage.removeItem(storageKey(key));
    uiLogger.warn('dpa_cache_read_failed', { key, error });
    return null;
  }
};

const writeStorage = <T>(key: string, entry: CacheEntry<T>) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(entry));
  } catch (error) {
    uiLogger.warn('dpa_cache_write_failed', { key, error });
  }
};

const normalizeStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  value.forEach((item) => {
    const normalized = String(item ?? '').trim();
    if (!normalized || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    result.push(normalized);
  });

  return result;
};

const fetchStringList = async (url: string): Promise<string[]> => {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  const payload = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.message?.trim() || DEFAULT_ERROR_MESSAGE);
  }

  return normalizeStringList(payload.data);
};

const fetchWithCache = async <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
  const now = Date.now();
  const existing = memoryCache.get(key) as MemoryEntry<T> | undefined;

  if (existing?.data && existing.expiresAt > now) {
    return existing.data;
  }

  if (existing?.promise) {
    return existing.promise;
  }

  const stored = readStorage<T>(key);
  if (stored) {
    memoryCache.set(key, { data: stored.data, expiresAt: stored.expiresAt });
    return stored.data;
  }

  const promise = fetcher()
    .then((data) => {
      const entry: CacheEntry<T> = { data, expiresAt: Date.now() + CACHE_TTL_MS };
      memoryCache.set(key, { data: entry.data, expiresAt: entry.expiresAt });
      writeStorage(key, entry);
      return data;
    })
    .catch((error) => {
      memoryCache.delete(key);
      throw error;
    });

  memoryCache.set(key, { promise, expiresAt: now + CACHE_TTL_MS });
  return promise;
};

export const getRegiones = async (): Promise<DpaRegion[]> => {
  return fetchWithCache('regiones', async () => fetchStringList(`${DPA_BASE_URL}/regiones`));
};

export const getComunasByRegion = async (regionName: string): Promise<DpaComuna[]> => {
  const region = regionName.trim();
  if (!region) {
    return [];
  }

  const cacheKey = `comunas:${region.toLowerCase()}`;
  return fetchWithCache(cacheKey, async () =>
    fetchStringList(`${DPA_BASE_URL}/comunas?region=${encodeURIComponent(region)}`)
  );
};
