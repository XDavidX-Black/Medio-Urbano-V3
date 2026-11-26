"use strict";
// Plan by default. Explicit --apply creates only missing V4 records.
// Uses Application Default Credentials, never service account JSON in Git.
const {initializeApp,applicationDefault}=require("firebase-admin/app");
const {getFirestore}=require("firebase-admin/firestore");
const {createHash}=require("node:crypto");
const args=process.argv.slice(2),emulator=args.includes("--emulator"),apply=args.includes("--apply");
const project=emulator?"demo-medio-urbano-v4":"medio-urbano";
if(!emulator&&!args.includes("--project=medio-urbano"))throw Error("Confirma --project=medio-urbano.");
if(emulator)process.env.FIRESTORE_EMULATOR_HOST="127.0.0.1:8080";
else if(process.env.FIRESTORE_EMULATOR_HOST)throw Error("No mezclar emulador y proyecto real.");
initializeApp(emulator?{projectId:project}:{projectId:project,credential:applicationDefault()});
const db=getFirestore(),brands=["cocina","salad","burgers","pasta"];
const id=s=>createHash("sha256").update(String(s)).digest("hex").slice(0,24);
const txt=(x,max)=>typeof x==="string"?x.trim().slice(0,max):"";
const cents=x=>{if(x==null||x==="")return null;const n=Number(x);return Number.isFinite(n)&&n>=0&&n<=100000?Math.round(n*100):null};
const picture=x=>{if(typeof x!=="string")return "";if(x.length<=1000&&(/^(https:\/\/|img\/)/.test(x)))return x;if(/^data:image\/(png|jpeg|webp);base64,/.test(x)&&x.length<800000)return x;return ""};
const time=x=>{if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(x||""))return null;const [h,m]=x.split(":").map(Number);return h*60+m};
async function main(){
 const [products,promos,...configs]=await Promise.all([db.collection("productos").get(),db.collection("promociones").get(),...["general","zonas","horarios","logos","hero","social","seo","pwa","brandIdentity"].map(k=>db.doc("config/"+k).get())]);
 const [general,zones,hours,logos,hero,social,seo,pwa,identity]=configs.map(d=>d.data()||{});
 const plan=[],warnings=[];
 for(const d of products.docs){const p=d.data(),price=cents(p.precio);if(!brands.includes(p.categoria)||!txt(p.nombre,100)||price===null||price===0){warnings.push("Producto omitido por precio/nombre/marca inválidos: "+d.id);continue}
 const image=picture(p.imagen);if(p.imagen&&!image)warnings.push("Imagen requiere revisión: "+d.id);
 const extras=(Array.isArray(p.extras)?p.extras:[]).slice(0,10).map((e,i)=>({id:id(d.id+":extra:"+i),name:txt(e.nombre,100),priceCents:cents(e.precio),active:true})).filter(e=>e.name&&e.priceCents!==null);
 const target=/^[A-Za-z0-9_-]{1,100}$/.test(d.id)?d.id:id(d.id);
 plan.push(["v4_productos/"+target,{name:txt(p.nombre,100),brand:p.categoria,description:txt(p.descripcion,300),priceCents:price,active:p.estado!==0&&p.estado!==false,featured:!!p.destacado,image:image.length<=1000?image:"",extras}]);
 if(image.length>1000)plan.push(["v4_config/legacyImage_"+target,{image}]);
 }
 for(const d of promos.docs){const p=d.data();plan.push(["v4_promociones/"+id(d.id),{title:txt(p.titulo,100),description:txt(p.descripcion,300),priceLabel:txt(String(p.precio??""),80),brand:txt(p.marca,30),image:picture(p.imagen),active:p.activo!==false,start:txt(p.fechaInicio,10),end:txt(p.fechaFin,10),legacyId:d.id}]);}
 const convertedZones=(Array.isArray(zones.zonas)?zones.zonas:[]).slice(0,40).flatMap((z,i)=>{const fee=cents(z.costo),name=txt(z.colonias,100);return fee===null||!name?[]:[{id:"legacy-"+i,name,feeCents:fee,active:true}]});
 const schedule=[];for(const [k,v] of Object.entries(hours)){const m=k.match(/^(cocina|salad|burgers|pasta)_([0-6])$/);if(!m||!v||v.activo===false)continue;const start=time(v.apertura),end=time(v.cierre);if(start!==null&&end!==null&&start!==end)schedule.push({brand:m[1],day:(Number(m[2])+1)%7,start,end,active:true})}
 const union=[...new Map(schedule.map(h=>[h.day+":"+h.start+":"+h.end,{day:h.day,start:h.start,end:h.end,active:true}])).values()];
 const phone=String(general.whatsapp||social.phone||"").replace(/\D/g,"");
 plan.push(["v4_config/publicCheckout",{open:false,minCents:cents(general.minimo)||0,zones:convertedZones,whatsapp:/^\d{10,15}$/.test(phone)?phone:"",announcement:"",autoHours:union.length>0,hours:union.slice(0,28),promotion:{active:false,percent:10,start:"",end:""}}]);
 const logoData=Object.fromEntries(["marca",...brands].map(b=>[b,picture(logos[b])]).filter(([,v])=>v));
 // split logo documents to stay below Firestore's 1 MiB document limit.
 for(const [b,image] of Object.entries(logoData))plan.push(["v4_logos/"+b,{image}]);
 plan.push(["v4_config/brandAssets",{hero:{title:txt(hero.titulo,120),subtitle:txt(hero.subtitulo,120),text:txt(hero.texto,300),button:txt(hero.btnTexto,60)},social:Object.fromEntries(["facebook","instagram","tiktok","youtube","website"].map(k=>[k,txt(social[k]||general[k],500)]))}]);
 plan.push(["v4_config/legacyArchive",{brandHours:schedule,zoneDetails:(Array.isArray(zones.zonas)?zones.zonas:[]).slice(0,40).map(z=>({colonias:txt(z.colonias,500),minimo:cents(z.minimo),tiempo:Number(z.tiempo)||0})),general:{envio:cents(general.envio),tiempo:Number(general.tiempo)||0,metodosPago:txt(general.metodosPago,300)},seo:{title:txt(seo.title,200),description:txt(seo.description,400)},pwa:{name:txt(pwa.name,100),desc:txt(pwa.desc,400)},identity:{slogan:txt(identity.slogan,300),descripcion:txt(identity.descripcion,400)}}]);
 let created=0,skipped=0;
 for(const [path,data] of plan){const ref=db.doc(path);if(apply){try{await ref.create(data);created++}catch(e){if(e.code===6||e.code==="already-exists")skipped++;else throw e}}else{if((await ref.get()).exists)skipped++;else created++}}
 console.log(JSON.stringify({project,mode:apply?"apply":"dry-run",planned:plan.length,createdOrWouldCreate:created,existingSkipped:skipped,warnings,notes:["No legacy records modified or deleted.","Existing V4 records never overwritten.","V4 remains closed by default; verify zones, prices and schedules.","Legacy orders not copied; tracking requires verified ownership. Promotions imported as advertising, not automatic price discounts."]},null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
