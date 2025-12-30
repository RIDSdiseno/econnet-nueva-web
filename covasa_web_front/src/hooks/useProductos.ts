import { useEffect, useState } from 'react';
import type { Product } from '../data/products';
import { obtenerProductos } from '../services/api';

export const useProductos = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setCargando(true);
      try {
        const data = await obtenerProductos();
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
  }, []);

  return { productos, cargando, error };
};
