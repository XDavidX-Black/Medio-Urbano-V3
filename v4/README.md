# Medio Urbano V4 — entorno separado

## Desarrollo local
Requiere Node.js 22, Java compatible con el emulador de Firestore, Firebase CLI y conexión para descargar SDK y dependencias. Desde la raíz del repositorio:

    git switch redesign-v4
    cd v4
    cd functions
    npm install
    npm test
    cd ..
    firebase emulators:start --project demo-medio-urbano-v4

En otra terminal, dentro de v4/functions:

    node seed-emulator.js

Abrir http://localhost:5000 y http://localhost:5000/admin.html. El usuario de prueba es admin@example.test y la clave DemoLocal-2026! exclusivamente en emulador. No usar esa contraseña en servicios reales.

## Arquitectura
- Hosting aislado en v4/public, sin publicar los HTML/JS de V3.
- Autenticación anónima para compradores; admin requiere custom claim admin:true asignado mediante Admin SDK desde entorno confiable.
- createOrder valida catálogo, extras, precios, mínimo, zona y estado de apertura. Transacción, token de idempotencia y límite por UID.
- updateOrderStatus verifica rol y transiciones de estado.
- Firestore impide escrituras directas de pedidos y lectura por terceros.
- El panel edita catálogo, extras, configuración de entrega y estados; deshacer/rehacer sólo en sesión actual, no es un sistema de auditoría persistente.
- Seguimiento ligado a UID y navegador; no comparte PII por enlace público.
- El cliente usa el WhatsApp configurado para consultas; no envía mensajes de forma automática.
- Las imágenes originales se copiaron como blobs Git; no se alteraron.
- PWA con caché acotada a activos públicos.

## Antes de cualquier publicación
1. Crear un proyecto Firebase de staging, diferente de V3. Habilitar Authentication anónima y email/password, Firestore, Functions, Hosting y App Check reCAPTCHA Enterprise; configurar dominios y presupuesto/alertas. Las Functions pueden requerir plan Blaze.
2. Ajustar public/config.js al proyecto de staging y su clave pública App Check; no introducir cuentas de servicio o secretos en Git.
3. Asignar el rol admin a una cuenta del propietario mediante Admin SDK seguro. No abrir el rol a usuarios autenticados ordinarios.
4. Ejecutar pruebas de reglas con emuladores, prueba de flujo extremo a extremo y de dos usuarios, concurrencia, recarga, reintento de pedido y cambios de precios. Validar en móvil/PC. Instalar dependencias y generar lockfile antes de despliegue.
5. Configurar catálogo, imágenes, extras, zonas, cobertura, horarios reales (actualmente apertura manual), costos, mínimos, impuestos y métodos de pago. No hay cobro en línea ni validación de zona geográfica: el cliente selecciona zona, el negocio confirma dirección. Promociones actuales son anuncios sin descuento automático.
6. Completar aviso de privacidad y política de retención, acceso y supresión de datos. Mantener noindex hasta aprobar lanzamiento.
7. Desplegar únicamente a proyecto staging explícito con firebase deploy --project ID_DE_STAGING desde v4. Nunca ejecutar contra V3. No se ha desplegado ni comprobado en navegador.

## Pendientes
Pruebas de integración reales y de reglas; App Check, configuración real, tarifas y catálogo, revisión legal, accesibilidad completa, recuperación de sesión entre dispositivos, validación geográfica y automatización de horarios, carga de imágenes, promociones con descuentos y pagos en línea si el negocio los requiere. Las estadísticas actuales se limitan a 100 pedidos recientes.

## Ampliación de operación y dashboard
- Dashboard por intervalo, máximo 5,000 pedidos, exportación CSV sin datos de contacto, ventas entregadas por fecha de creación, ticket promedio, estados, unidades por marca y productos más vendidos. No representa pagos conciliados ni utilidad.
- Horario automático en America/Cancun, inclusive turnos nocturnos; cierre manual prevalece.
- Descuento global porcentual de 1–50%, fechas opcionales, calculado por servidor y sin descuento sobre envío. No acumula promociones.
- Cobertura radial opcional por zona; el servidor comprueba distancia en línea recta de coordenadas declaradas, no rutas ni autenticidad del GPS.
- Carga de fotos de hasta 5 MB en Storage con rol administrativo. No elimina automáticamente imágenes huérfanas.
- Las configuraciones reales, pruebas integradas, aviso legal, recuperación de cuenta entre dispositivos y eventual pago en línea siguen pendientes. No se ha desplegado a Firebase.
