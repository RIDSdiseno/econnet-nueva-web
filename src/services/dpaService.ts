import { uiLogger } from '../utils/logger';
import { API_BASE_URL } from './api';

export type DpaSector = {
  codigo: string;
  nombre: string;
  tipo?: string;
  codigo_padre?: string | null;
  lat?: string | null;
  lng?: string | null;
  url?: string | null;
};

export type DpaRegion = DpaSector;
export type DpaComuna = DpaSector;

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
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
const STORAGE_PREFIX = 'covasa_dpa_cache_v1';
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

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error('No se pudo obtener datos de la DPA');
  }
  return response.json() as Promise<T>;
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

const normalizeSector = (sector: Record<string, unknown>): DpaSector | null => {
  const codigo = String(sector.codigo ?? sector.code ?? sector.id ?? '').trim();
  const nombre = String(sector.nombre ?? sector.name ?? '').trim();

  if (!codigo || !nombre) {
    return null;
  }

  return {
    codigo,
    nombre,
    tipo: (sector.tipo ?? sector.type ?? undefined) as string | undefined,
    codigo_padre: (sector.codigo_padre ?? sector.codigoPadre ?? null) as string | null,
    lat: (sector.lat ?? sector.latitude ?? null) as string | null,
    lng: (sector.lng ?? sector.longitude ?? null) as string | null,
    url: (sector.url ?? null) as string | null,
  };
};

const normalizeSectorList = (data: unknown): DpaSector[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => (item && typeof item === 'object' ? normalizeSector(item as Record<string, unknown>) : null))
    .filter((item): item is DpaSector => Boolean(item));
};

const sortByNombre = (a: DpaSector, b: DpaSector) => a.nombre.localeCompare(b.nombre, 'es');

const resolveRegionCodigo = async (regionCodeOrName: string) => {
  const trimmed = regionCodeOrName.trim();
  if (!trimmed) {
    return null;
  }

  const regiones = await getRegiones();
  const byCode = regiones.find((region) => region.codigo === trimmed);
  if (byCode) {
    return byCode.codigo;
  }

  const normalized = trimmed.toLowerCase();
  const byName = regiones.find((region) => region.nombre.toLowerCase() === normalized);
  if (byName) {
    return byName.codigo;
  }

  const fuzzy = regiones.find((region) => region.nombre.toLowerCase().includes(normalized));
  return fuzzy?.codigo ?? null;
};

export const getRegiones = async (): Promise<DpaRegion[]> => {
  return fetchWithCache('regiones', async () => {
    const data = await fetchJson<unknown>(`${DPA_BASE_URL}/regiones`);
    return normalizeSectorList(data).sort(sortByNombre);
  });
};

export const getComunasByRegion = async (regionCodeOrName: string): Promise<DpaComuna[]> => {
  const codigoRegion = await resolveRegionCodigo(regionCodeOrName);
  if (!codigoRegion) {
    return [];
  }

  const cacheKey = `comunas:${codigoRegion}`;

  return fetchWithCache(cacheKey, async () => {
    try {
      const data = await fetchJson<unknown>(`${DPA_BASE_URL}/regiones/${codigoRegion}/comunas`);
      return normalizeSectorList(data).sort(sortByNombre);
    } catch (error) {
      uiLogger.warn('dpa_comunas_endpoint_failed', { region: codigoRegion, error });
      const data = await fetchJson<unknown>(`${DPA_BASE_URL}/comunas`);
      const comunas = normalizeSectorList(data);
      const prefix = codigoRegion.padStart(2, '0');
      return comunas
        .filter((comuna) => comuna.codigo.startsWith(prefix))
        .sort(sortByNombre);
    }
  });
};
