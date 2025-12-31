# Pagos merge DEV -> MAIN

## Archivos tocados
- covasa_web_front/src/services/api.ts
- covasa_web_front/src/pages/CartPage.tsx
- covasa_web_front/src/pages/MercadoPagoReturnPage.tsx
- covasa_web_front/src/pages/TransbankReturnPage.tsx
- covasa_web_front/src/App.tsx

## Cambios y justificacion (que / por que / impacto)
- covasa_web_front/src/services/api.ts. Que: se agrego cliente HTTP para pedidos y pagos (Mercado Pago/Transbank) y confirmacion Transbank. Por que: MAIN no tenia servicios y el flujo de pago necesita endpoints del backend. Impacto: habilita crear pedido, iniciar pago y confirmar pago desde el front.
- covasa_web_front/src/pages/CartPage.tsx. Que: se reemplazo el placeholder de pago por formulario de despacho, validacion y disparo real de pagos; se mapea el carrito actual a payload del backend y se mantiene el guard de login. Por que: el checkout debe crear pedido y redirigir a MP/TBK. Impacto: carrito -> checkout -> pago funciona sin romper el modelo actual del carrito.
- covasa_web_front/src/pages/MercadoPagoReturnPage.tsx. Que: se agrego pagina de retorno para leer parametros y mostrar estado. Por que: Mercado Pago retorna al front con datos de estado. Impacto: el usuario ve resultado y se limpia el carrito si el pago se aprueba.
- covasa_web_front/src/pages/TransbankReturnPage.tsx. Que: se agrego pagina de retorno que confirma el pago con el backend usando el token. Por que: Transbank requiere commit server-side antes de mostrar el estado final. Impacto: el usuario ve el estado confirmado y el carrito se limpia en caso de exito.
- covasa_web_front/src/App.tsx. Que: se registraron rutas de retorno /pago/mercadopago y /pago/transbank. Por que: los callbacks necesitan rutas visibles en el router. Impacto: el flujo de retorno funciona sin alterar las rutas existentes.

## Variables de entorno
- No se agregaron nuevas variables. Se reutiliza `VITE_API_URL`.
- Ejemplo:
  - VITE_API_URL=http://localhost:3000/api

## Diagrama de flujo de pago (texto)
Catalogo -> Carrito -> Checkout (despacho + crear pedido) -> Crear pago MP/TBK -> Redirect a pasarela
-> Return /pago/mercadopago o /pago/transbank -> Confirmar estado -> Mostrar resultado -> Limpiar carrito si aprobado

## Como testear (pasos exactos)
1) npm install (en `covasa_web_front`).
2) npm run dev (verificar que el servidor levante).
3) npm run build (verificar build sin errores).
4) Catalogo carga productos reales.
5) Carrito: agregar/quitar/actualizar cantidad.
6) Checkout: completar despacho y crear pedido.
7) Elegir Mercado Pago o Transbank e iniciar pago sin errores.
8) Retorno success/fail/pending muestra pantalla correcta y no rompe el flujo original.
