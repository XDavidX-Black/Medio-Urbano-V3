// Execute only with local emulators. Never connect to production.
const test=require("node:test"),assert=require("node:assert/strict"),{initializeTestEnvironment,assertFails,assertSucceeds}=require("@firebase/rules-unit-testing"),{doc,getDoc,setDoc,collection,getDocs}=require("firebase/firestore"),fs=require("node:fs"),path=require("node:path");
test("privacy and administrative authorization",async()=>{
 const env=await initializeTestEnvironment({projectId:"demo-medio-urbano-v4",firestore:{host:"127.0.0.1",port:8080,rules:fs.readFileSync(path.join(__dirname,"../firestore.rules"),"utf8")}});
 try{
 const id="fixture-order";await env.withSecurityRulesDisabled(async c=>{await setDoc(doc(c.firestore(),"pedidos",id),{ownerUid:"buyer-a",estado:"Pendiente"});});
 const buyer=env.authenticatedContext("buyer-a").firestore(),other=env.authenticatedContext("buyer-b").firestore(),anon=env.unauthenticatedContext().firestore(),admin=env.authenticatedContext("admin",{admin:true}).firestore();
 await assertSucceeds(getDoc(doc(buyer,"pedidos",id)));await assertFails(getDoc(doc(other,"pedidos",id)));await assertFails(getDoc(doc(anon,"pedidos",id)));await assertFails(getDocs(collection(buyer,"pedidos")));await assertSucceeds(getDocs(collection(admin,"pedidos")));await assertFails(setDoc(doc(admin,"pedidos",id),{estado:"Entregado"}));
 const p={name:"Prueba",brand:"cocina",description:"",priceCents:100,active:true,image:"",extras:[],featured:false};
 await assertFails(setDoc(doc(buyer,"productos","fixture-product"),p));await assertSucceeds(setDoc(doc(admin,"productos","fixture-product"),p));await assertSucceeds(getDoc(doc(anon,"productos","fixture-product")));
 }finally{await env.cleanup()}
});
