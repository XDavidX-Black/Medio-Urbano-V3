// Execute only with local emulators. Never connect to production.
const test=require("node:test"),assert=require("node:assert/strict"),{initializeTestEnvironment,assertFails,assertSucceeds}=require("@firebase/rules-unit-testing"),{doc,getDoc,setDoc,collection,getDocs}=require("firebase/firestore"),fs=require("node:fs"),path=require("node:path");
test("privacy and administrative authorization",async()=>{
 const env=await initializeTestEnvironment({projectId:"demo-medio-urbano-v4",firestore:{host:"127.0.0.1",port:8080,rules:fs.readFileSync(path.join(__dirname,"../firestore.rules"),"utf8")}});
 try{
 const id="fixture-order";await env.withSecurityRulesDisabled(async c=>{await setDoc(doc(c.firestore(),"v4_pedidos",id),{ownerUid:"buyer-a",estado:"Pendiente"});});
 const buyer=env.authenticatedContext("buyer-a").firestore(),other=env.authenticatedContext("buyer-b").firestore(),anon=env.unauthenticatedContext().firestore(),admin=env.authenticatedContext("admin",{admin:true}).firestore();
 await assertSucceeds(getDoc(doc(buyer,"v4_pedidos",id)));await assertFails(getDoc(doc(other,"v4_pedidos",id)));await assertFails(getDoc(doc(anon,"v4_pedidos",id)));await assertFails(getDocs(collection(buyer,"v4_pedidos")));await assertSucceeds(getDocs(collection(admin,"v4_pedidos")));await assertFails(setDoc(doc(admin,"v4_pedidos",id),{estado:"Entregado"}));
 const p={name:"Prueba",brand:"cocina",description:"",priceCents:100,active:true,image:"",extras:[],featured:false};
 await assertFails(setDoc(doc(buyer,"v4_productos","fixture-product"),p));await assertSucceeds(setDoc(doc(admin,"v4_productos","fixture-product"),p));await assertSucceeds(getDoc(doc(anon,"v4_productos","fixture-product")));
 const brand={name:"Urban Tacos",active:true,order:50,logo:""};await assertFails(setDoc(doc(buyer,"v4_marcas","brand-tacos"),brand));await assertFails(setDoc(doc(admin,"v4_productos","fixture-custom"),{...p,brand:"brand-tacos"}));await assertSucceeds(setDoc(doc(admin,"v4_marcas","brand-tacos"),brand));await assertSucceeds(getDoc(doc(anon,"v4_marcas","brand-tacos")));await assertSucceeds(setDoc(doc(admin,"v4_productos","fixture-custom"),{...p,brand:"brand-tacos"}));await assertFails(setDoc(doc(admin,"v4_marcas","marca"),brand));
 }finally{await env.cleanup()}
});
