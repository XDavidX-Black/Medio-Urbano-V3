/*====================================================
security-utils.js - MEDIO URBANO V3
Utilidad para prevenir XSS al insertar datos dinámicos
con innerHTML (nombres de clientes, direcciones,
productos, comentarios, etc.)

Cárgalo ANTES de dashboard.js, panel-manager.js,
admin-v3.js y admin-promos.js.
=====================================================*/

function esc(value){
  if(value===null||value===undefined) return "";
  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}
