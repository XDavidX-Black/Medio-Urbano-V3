const {openNow,discountFor,inZone}=require("./policy");
function fail(m){throw new Error(m)}

function cents(v){if(typeof v!=="number"||!Number.isSafeInteger(v)||v<0||v>10000000)fail("Importe inválido");return v}

function clean(v,max,required=true){if(typeof v!=="string")fail("Texto inválido");v=v.trim();if(v.length>max||(required&&!v.length))fail("Longitud de texto inválida");return v}

function normalize(data){
 if(!data||typeof data!=="object"||!Array.isArray(data.items)||data.items.length<1||data.items.length>30)fail("Carrito inválido");
 const token=clean(data.token,80);if(!/^[a-zA-Z0-9_-]{16,80}$/.test(token))fail("Token inválido");
 const seen=new Set();let units=0;
 const items=data.items.map(x=>{if(!x||typeof x!=="object")fail("Producto inválido");const id=clean(x.id,100);if(!/^[a-zA-Z0-9_-]+$/.test(id))fail("ID inválido");
 if(!Number.isInteger(x.qty)||x.qty<1||x.qty>20)fail("Cantidad inválida");units+=x.qty;
 if(!Array.isArray(x.extras)||x.extras.length>10)fail("Extras inválidos");const extras=x.extras.map(e=>clean(e,60)).sort();if(new Set(extras).size!==extras.length)fail("Extra duplicado");
 const key=JSON.stringify([id,extras]);if(seen.has(key))fail("Línea duplicada");seen.add(key);return {id,qty:x.qty,extras}});
 if(units>60)fail("Demasiados productos");
 const contact=data.contact;if(!contact||typeof contact!=="object")fail("Contacto inválido");
 const phone=clean(contact.phone,30).replace(/[ ()+-]/g,"");if(!/^\d{10,15}$/.test(phone))fail("Teléfono inválido");
 const customer={name:clean(contact.name,100),phone,address:clean(contact.address,250),notes:clean(contact.notes??"",300,false)};
 if(contact.location!=null){const {lat,lng}=contact.location;if(typeof lat!=="number"||typeof lng!=="number"||!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)fail("Ubicación inválida");customer.location={lat,lng}}
 const payment=clean(data.payment,30);if(!["Efectivo","Transferencia"].includes(payment))fail("Pago inválido");
 return {token,items,customer,payment,zone:clean(data.zone,60),expectedTotal:cents(data.expectedTotal)};
}

const originalBrands=new Set(["cocina","salad","burgers","pasta"]);
function brandAvailable(id,registry){return typeof id==="string"&&/^[a-z0-9][a-z0-9-]{0,29}$/.test(id)&&id!=="marca"&&(Object.hasOwn(registry,id)?registry[id]?.active===true:originalBrands.has(id))}
function quote(req,catalog,config,now=new Date(),registry={}){
 if(!openNow(config,now))fail("Tienda cerrada");
 const zone=config.zones?.find(z=>z.id===req.zone&&z.active===true);if(!zone)fail("Zona de envío no disponible");if(!inZone(zone,req.customer.location))fail("La ubicación está fuera de cobertura o falta indicar la ubicación de entrega");
 let subtotal=0;
 const items=req.items.map(line=>{const p=catalog[line.id];if(!p||p.active!==true||!brandAvailable(p.brand,registry))fail("Producto o marca no disponible");const base=cents(p.priceCents);if(base===0)fail("Precio no configurado");const options=line.extras.map(id=>{const e=p.extras?.find(x=>x.id===id&&x.active===true);if(!e)fail("Extra no disponible");return {id,name:clean(e.name,100),priceCents:cents(e.priceCents)}});const unit=base+options.reduce((a,x)=>a+x.priceCents,0);const total=unit*line.qty;subtotal+=total;return {id:line.id,name:clean(p.name,100),brand:clean(p.brand,30),brandName:clean(registry[p.brand]?.name||p.brand,80),qty:line.qty,extras:options,unitCents:unit,totalCents:total}});
 if(subtotal<cents(config.minCents))fail("Compra mínima no alcanzada");
 const discount=discountFor(config,subtotal,now),delivery=cents(zone.feeCents),total=subtotal-discount+delivery;
 if(total>10000000)fail("Pedido demasiado grande");
 if(total!==req.expectedTotal)fail("El importe cambió; revisa el carrito antes de confirmar");
 return {items,subtotalCents:subtotal,discountCents:discount,deliveryCents:delivery,totalCents:total,zone:{id:zone.id,name:clean(zone.name,100)}};
}

function transition(a,b){return ({Pendiente:["Preparando","Cancelado"],Preparando:["En reparto","Cancelado"],"En reparto":["Entregado","Cancelado"],Entregado:[],Cancelado:[]}[a]||[]).includes(b)}
module.exports={normalize,quote,transition};
