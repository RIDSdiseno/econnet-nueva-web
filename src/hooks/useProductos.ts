import { useEffect, useState } from 'react';
import type { Product } from '../data/products';
import { obtenerProductos } from '../services/api';

type UseProductosParams = {
  search?: string;
  limit?: number;
};

export const useProductos = (params?: UseProductosParams) => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const search = params?.search ?? '';
  const limit = params?.limit;

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setCargando(true);
      try {
        const data = await obtenerProductos({ search, limit });
        if (!activo) {
          return;
        }
        setProductos(data);
        setError(null);
      } catch (err) {
        if (!activo) {
          return;
        }
        const mensaje = err instanceof Error ? err.message : 'No se pudo cargar el catalogo desde la API.';
        setError(mensaje);
        setProductos([]);
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [search, limit]);

  return { productos, cargando, error };
};
