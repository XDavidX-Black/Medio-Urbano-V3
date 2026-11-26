
import {settings} from "./config.js";
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {getAuth,connectAuthEmulator,signInAnonymously,onAuthStateChanged,signInWithEmailAndPassword,signOut} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {getFirestore,connectFirestoreEmulator,collection,doc,onSnapshot,setDoc,deleteDoc,query,orderBy,limit,getDocs} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {getStorage,connectStorageEmulator,ref,uploadBytes,getDownloadURL} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import {getFunctions,connectFunctionsEmulator,httpsCallable} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js";
import {initializeAppCheck,ReCaptchaEnterpriseProvider} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-check.js";
if(!settings.emulator&&(!settings.appCheckSiteKey||settings.firebase.projectId.startsWith("demo-")))throw Error("Configura un Firebase de pruebas y App Check antes de publicar.");
const app=initializeApp(settings.firebase);
if(!settings.emulator)initializeAppCheck(app,{provider:new ReCaptchaEnterpriseProvider(settings.appCheckSiteKey),isTokenAutoRefreshEnabled:true});
const auth=getAuth(app),db=getFirestore(app),functions=getFunctions(app,settings.region),storage=getStorage(app);
if(settings.emulator){connectAuthEmulator(auth,"http://127.0.0.1:9099",{disableWarnings:true});connectFirestoreEmulator(db,"127.0.0.1",8080);connectFunctionsEmulator(functions,"127.0.0.1",5001);connectStorageEmulator(storage,"127.0.0.1",9199);}
const $=id=>document.getElementById(id);
const money=c=>new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(c/100);
const brands=["cocina","salad","burgers","pasta"];
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e}
function button(label,action,cls="secondary"){const b=el("button",label,cls);b.type="button";b.addEventListener("click",action);return b}
function imageFor(p){const fallback="img/logo-"+(brands.includes(p.brand)?p.brand:"marca")+".png";try{const u=new URL(p.image,location.href);if(u.protocol==="https:"||u.origin===location.origin)return u.href}catch{}return fallback}
async function customerAuth(){await auth.authStateReady();return auth.currentUser|| (await signInAnonymously(auth)).user}
function err(e){return e?.message||"Ocurrió un error."}
export {auth,db,functions,storage,ref,uploadBytes,getDownloadURL,$,money,brands,el,button,imageFor,customerAuth,err,collection,doc,onSnapshot,setDoc,deleteDoc,query,orderBy,limit,getDocs,httpsCallable,onAuthStateChanged,signInWithEmailAndPassword,signOut};
