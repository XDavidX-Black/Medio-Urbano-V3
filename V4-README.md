# Medio Urbano V4 — Urban Premium
## Prueba local
Descargar/clonar la rama redesign-v4, servir la raíz con `python -m http.server 8000` y abrir http://localhost:8000/test-v4.html. El panel local está en admin-v4-demo.html. Los dos comparten el almacenamiento del mismo navegador/origen. Los precios y productos demo son ficticios; las imágenes son los logos originales. No se conecta Firebase ni WhatsApp; GPS real desactivado. No usar datos de clientes.
## Auditoría inicial
- CRÍTICO: firestore.rules de V3 permite lectura pública de pedidos; las reglas se solapan por OR. No usar con datos reales.
- ALTO: request.auth != null no verifica rol administrativo; las escrituras a catálogo, config y Storage necesitan autorización por rol.
- ALTO: el cliente determina el total, y la promoción puede ingresar a precio cero. El servidor debe recalcular usando catálogo y políticas.
- ALTO: seguimiento V3 consulta pedidos por identificador y expone datos personales; usar acceso por propietario autenticado.
- ALTO: campos de catálogo y cliente llegan a innerHTML en V3; usar DOM/textContent y validar URLs.
- MEDIO: contador de pedidos no transaccional; usar identificador generado por servidor e idempotencia.
- MEDIO: SW V3 elimina cachés de otros apps del mismo origen; restringir namespace y no cachear datos de pedidos.
## Candidato de seguridad (NO desplegado)
v4-security/firestore.rules y storage.rules son reglas propuestas para un proyecto Firebase separado. Requieren rol admin asignado desde servidor, autenticación anónima para clientes, función de pedidos, migración de tracking y revisión de panel existente. No reemplazar reglas del proyecto V3 sin probar en emulador. No publicar hasta completar los bloqueos.
## Validación pendiente
[ ] Prueba visual PC y móvil, lectores de pantalla y teclado.
[ ] Catálogo, búsquedas, carrito, compra mínima, envío, simulación, edición/undo/redo y seguimiento desde panel demo.
[ ] Confirmar productos/precios/fotos reales, horarios, cobertura, mínimos, impuestos y cobros.
[ ] Implementar/configurar backend de pruebas, App Check y reglas, asignar rol administrador, conectar seguimiento privado, configurar WhatsApp.
[ ] Pruebas de permisos e idempotencia en emulador; prueba de pedido extremo a extremo.
[ ] Revisar privacidad, datos y retención; publicar sólo después de la aceptación.
