# Diagnostico - Loop de requests en cotizacion

Fecha: 2026-01-27

## Endpoints involucrados (flujo cotizacion)
- `POST /api/ecommerce/cotizaciones` -> creacion de cotizacion (frontend: `src/pages/QuotePage.tsx`).
- `GET /api/ecommerce/cotizaciones/:id` -> detalle/resumen (frontend: `src/pages/QuoteDetailPage.tsx`).

## Causa raiz (codigo)
- El resumen se carga via `useEffect` en `QuoteDetailPage`. Sin guardas extra, en modo dev (StrictMode) y/o si una dependencia no es estable, el efecto puede ejecutarse mas de una vez para el mismo `cotizacionId`, provocando multiples GET y parpadeo del resumen (flicker).
- En el proyecto tambien habia callbacks de contexto no memoizados (`CartContext`) usados en dependencias de `useEffect` de paginas de retorno de pago. Eso disparaba re-render -> re-ejecucion de efectos y requests repetidos.

## Archivos clave
- `src/pages/QuotePage.tsx`: POST de cotizacion (evento `onSubmit`).
- `src/pages/QuoteDetailPage.tsx`: GET del detalle/resumen.
- `src/context/CartContext.tsx`: callbacks no memoizados que provocaban efectos repetidos en consumidores.

## Fix aplicado (resumen)
- Guardas para ejecutar el GET de detalle solo una vez por `cotizacionId` y permitir refetch solo por accion explicita del usuario.
- Callbacks de `CartContext` memorizados para evitar que `useEffect` de consumidores se dispare en bucle.

Nota: En este entorno CLI no fue posible abrir DevTools para observar el Network panel, por lo que el diagnostico se baso en inspeccion del codigo y rutas de llamadas. Si se desea, se puede validar en navegador local que no haya requests repetidos.
