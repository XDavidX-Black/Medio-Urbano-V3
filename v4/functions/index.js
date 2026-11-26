"use strict";
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { createHash } = require("node:crypto");
const { normalize, quote, transition } = require("./core");
initializeApp();
const db=getFirestore();
const options={region:"us-central1",enforceAppCheck:process.env.FUNCTIONS_EMULATOR!=="true",maxInstances:5,timeoutSeconds:30};
const hash=x=>createHash("sha256").update(x).digest("hex");
function auth(request){if(!request.auth)throw new HttpsError("unauthenticated","Inicia sesión.");return request.auth.uid}
function admin(request){auth(request);if(request.auth.token.admin!==true)throw new HttpsError("permission-denied","Permiso administrativo requerido.");}
function invalid(e){if(e instanceof HttpsError)throw e;throw new HttpsError("invalid-argument",e.message)}
exports.v4CreateOrder=onCall(options,async request=>{
 const uid=auth(request);let req;try{req=normalize(request.data)}catch(e){invalid(e)}
 const id=hash(uid+":"+req.token), ref=db.collection("v4_pedidos").doc(id), gate=db.collection("v4_orderRate").doc(uid);
 const fingerprint=hash(JSON.stringify(req));
 return db.runTransaction(async tx=>{
  const existing=await tx.get(ref);
  if(existing.exists){const d=existing.data();if(d.ownerUid!==uid||d.fingerprint!==fingerprint)throw new HttpsError("already-exists","La solicitud ya existe con otros datos.");return {id,totalCents:d.totalCents,estado:d.estado};}
  const ids=[...new Set(req.items.map(x=>x.id))];
  const docs=await tx.getAll(db.doc("v4_config/publicCheckout"),gate,...ids.map(id=>db.collection("v4_productos").doc(id)));
  const [cfg,rate,...productDocs]=docs;
  const now=Date.now(), previous=rate.data()?.lastMs||0;if(now-previous<15000)throw new HttpsError("resource-exhausted","Espera unos segundos para realizar otro pedido.");
  const catalog=Object.fromEntries(productDocs.filter(d=>d.exists).map(d=>[d.id,d.data()]));
  const brandIds=[...new Set(Object.values(catalog).map(p=>p.brand))];if(brandIds.some(id=>typeof id!=="string"||!/^[a-z0-9][a-z0-9-]{0,29}$/.test(id)||id==="marca"))throw new HttpsError("failed-precondition","Marca inválida");const brandDocs=brandIds.length?await tx.getAll(...brandIds.map(id=>db.collection("v4_marcas").doc(id))):[];const registry=Object.fromEntries(brandDocs.filter(d=>d.exists).map(d=>[d.id,d.data()]));
  let priced;try{priced=quote(req,catalog,cfg.data(),new Date(now),registry)}catch(e){invalid(e)}
  tx.create(ref,{...priced,ownerUid:uid,fingerprint,customer:req.customer,payment:req.payment,estado:"Pendiente",createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
  tx.set(gate,{lastMs:now});return {id,totalCents:priced.totalCents,estado:"Pendiente"};
 });
});
exports.v4UpdateOrderStatus=onCall(options,async request=>{
 admin(request);const {id,estado}=request.data||{};
 if(typeof id!=="string"||!/^[a-f0-9]{64}$/.test(id)||typeof estado!=="string")throw new HttpsError("invalid-argument","Pedido inválido");
 const ref=db.collection("v4_pedidos").doc(id);
 await db.runTransaction(async tx=>{const snap=await tx.get(ref);if(!snap.exists)throw new HttpsError("not-found","Pedido no encontrado");if(!transition(snap.data().estado,estado))throw new HttpsError("failed-precondition","Transición de estado inválida");tx.update(ref,{estado,updatedAt:FieldValue.serverTimestamp()});});
 return {id,estado};
});
