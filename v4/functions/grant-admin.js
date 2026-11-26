"use strict";
// Run locally using authorized Application Default Credentials. Never store credentials in Git.
const {initializeApp,applicationDefault}=require("firebase-admin/app");
const {getAuth}=require("firebase-admin/auth");
const args=process.argv.slice(2),email=args.find(x=>x.startsWith("--email="))?.slice(8),apply=args.includes("--apply");
if(!args.includes("--project=medio-urbano")||!email||process.env.FIREBASE_AUTH_EMULATOR_HOST)throw Error("Use --project=medio-urbano --email=CORREO; add --apply only after checking account.");
initializeApp({projectId:"medio-urbano",credential:applicationDefault()});
(async()=>{const auth=getAuth(),u=await auth.getUserByEmail(email);if(u.disabled||!u.providerData.some(p=>p.providerId==="password"))throw Error("Cuenta deshabilitada o no válida.");console.log(JSON.stringify({project:"medio-urbano",uid:u.uid,email:u.email,emailVerified:u.emailVerified,alreadyAdmin:u.customClaims?.admin===true,mode:apply?"apply":"dry-run"}));if(apply){if(!u.emailVerified)throw Error("Verifica primero el correo de la cuenta administrativa.");await auth.setCustomUserClaims(u.uid,{...(u.customClaims||{}),admin:true});console.log("Rol asignado. Cierra y vuelve a iniciar sesión.");}})().catch(e=>{console.error(e.message);process.exitCode=1});
