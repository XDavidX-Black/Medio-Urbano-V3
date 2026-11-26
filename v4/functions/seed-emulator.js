
"use strict";
// Emulator only. No live project writes are possible through this script.
process.env.FIRESTORE_EMULATOR_HOST="127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099";
const {initializeApp}=require("firebase-admin/app");
const {getAuth}=require("firebase-admin/auth");
const {getFirestore}=require("firebase-admin/firestore");
initializeApp({projectId:"demo-medio-urbano-v4"});
(async()=>{const auth=getAuth(),db=getFirestore();let user;try{user=await auth.getUserByEmail("admin@example.test")}catch{user=await auth.createUser({email:"admin@example.test",password:"DemoLocal-2026!"})}
await auth.setCustomUserClaims(user.uid,{admin:true});
const batch=db.batch();for(const [id,brand,name,priceCents] of [["c1","cocina","Pollo asado",14500],["s1","salad","Salad Premium",15900],["b1","burgers","Urban Burger",14900],["p1","pasta","Pasta cremosa",13500]])batch.set(db.collection("v4_productos").doc(id),{brand,name,priceCents,description:"Producto ficticio para pruebas.",active:true,featured:true,image:"img/logo-"+brand+".png",extras:[{id:"extra1",name:"Extra de prueba",priceCents:1000,active:true}]});
batch.set(db.doc("v4_config/publicCheckout"),{open:true,minCents:10000,zones:[{id:"centro",name:"Centro (demo)",feeCents:3000,active:true}],whatsapp:"",announcement:"Precios ficticios · entorno local"});await batch.commit();console.log("Emuladores: admin@example.test / DemoLocal-2026!");})().catch(e=>{console.error(e);process.exitCode=1});
