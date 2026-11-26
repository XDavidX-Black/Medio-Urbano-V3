# Medio Urbano V4 · reutilización segura de Firebase

Se reutiliza el proyecto existente `medio-urbano` y su configuración Web SDK. La V4 se mantiene deshabilitada fuera del emulador hasta terminar el despliegue. No se ha conectado a datos reales ni se ha ejecutado la migración.

## Emulador (sin tocar Firebase real)
Desde v4/functions: npm install, npm test. Desde v4: firebase emulators:start --config firebase.local.json --project demo-medio-urbano-v4. En otra terminal, desde v4/functions: node seed-emulator.js. Abrir http://localhost:5000 y /admin.html. Cuenta de prueba exclusiva del emulador: admin@example.test / DemoLocal-2026!. Con el emulador en ejecución: npm run test:rules.

## Migración del mismo proyecto
- V3 conserva los documentos originales; V4 usa v4_productos, v4_pedidos, v4_config, v4_orderRate, v4_promociones y v4_logos.
- Se reutilizan Authentication, Storage, SDK y logotipos originales. El script convierte precios a centavos, extras, catálogo, zonas, horarios y datos de marca; conserva promos como anuncios, no descuentos automáticos. No migra pedidos antiguos por falta de propietario autenticado.
- Desde v4/functions con credenciales ADC autorizadas: node migrate-v3.js --project=medio-urbano (solo plan, no escrituras). Revisar advertencias. Con aprobación y respaldo: node migrate-v3.js --project=medio-urbano --apply. No sobreescribe documentos existentes de V4 ni modifica V3. La V4 se crea cerrada. Para ensayo, usar --emulator.
- Los horarios antiguos por marca se preservan en el archivo administrativo; la apertura global usa su unión y requiere revisar disponibilidad de cada marca. Zonas antiguas conservan nombres y tarifas; mínimos por zona y tiempos se archivan para revisión. Imágenes base64 de productos se guardan por separado y se muestran si están disponibles. Configuración de contacto y textos conservados selectivamente.
- Las reglas son compartidas en el proyecto. Antes de habilitar auth anónima deben instalarse reglas seguras. Las propuestas cierran la lectura/escritura pública de pedidos V3 y restringen escrituras antiguas a administradores; el checkout y seguimiento público V3 dejarán de funcionar bajo estas reglas. Código y datos V3 quedan intactos, pero no se garantiza compatibilidad operativa simultánea. Revisar las rutas de Storage antiguas antes de publicar.
- Usar un sitio Hosting distinto (target v4), no el sitio por defecto. Functions se llaman v4CreateOrder y v4UpdateOrderStatus, codebase medio-urbano-v4. No desplegar funciones ajenas ni aceptar eliminaciones.
- Configurar App Check, auth anónima y email/password y asignar custom claim admin:true únicamente a las cuentas administrativas verificadas. No usar claves privadas ni compartir contraseñas. Functions/Storage pueden requerir plan de facturación.
- Antes de activar liveEnabled, probar reglas en emulador, migración, integración de pedidos y permisos, UI móvil/PC, configurar sitio Hosting separado, confirmar catálogo/zonas/horarios y aviso de privacidad. No desplegar sin respaldo y aprobación de cambios de reglas. No se ha ejecutado ningún despliegue.

## Dashboard y operación
Reportes por intervalo hasta 5000 pedidos, exportación CSV sin contacto, ventas entregadas agrupadas por fecha de creación, ticket promedio, unidades por marca y productos más vendidos. No son cobros conciliados. Descuentos globales 1–50%, GPS por radio (no verifica autenticidad de coordenadas), horario Cancún, carga de fotos hasta 5 MB, PWA. Pendientes: validación integral y aviso de privacidad aprobado, pagos en línea si se desean, recuperación de sesión entre dispositivos.

## Cierre técnico
- El catálogo visual consume las fotos migradas, logos dinámicos, portada, redes y anuncios. El panel V4 permite editar esos elementos independientemente de V3.
- Para asignar rol al administrador existente, con ADC y correo verificado: node grant-admin.js --project=medio-urbano --email=CORREO (plan); agregar --apply tras verificar UID. Nunca enviar credenciales en chat.
- Configura un target Hosting V4 distinto del sitio original; para local usar firebase.local.json (sin target). No habilitar liveEnabled hasta validar permisos y App Check.
- Pagos por transferencia/efectivo se conservan; cobro en línea requiere proveedor, cuenta comercial y decisión explícita. No se ha activado ningún gasto ni desplegado.

## UI ampliable
- `admin-modules.js`: registro de módulos del panel (id, grupo, título, descripción e icono). Añade una sección `module-view` con ese ID y un script independiente. El shell gestiona rutas hash y navegación responsive. Los permisos reales siguen en Firebase.
- `admin-shell.css` y `store-layout.css` separan estilos de administración y tienda, con tokens comunes en `style.css`.
- Dashboard: rangos rápidos, gráfica diaria y tabla de datos, distribución por estado, ranking y accesos operativos. Conserva límites y criterio de ventas del informe anterior.
- Tienda: destacados, filtros y orden de productos sin modificar el esquema Firestore. Futuras funciones (inventario, clientes, sucursales, roles, pagos) requieren módulos y reglas propias; no están activadas.
- Actualizar localmente con `git pull --ff-only origin redesign-v4` y Ctrl+F5. No requiere desplegar Firebase. Revisar en emuladores escritorio/móvil y pedidos de prueba.
