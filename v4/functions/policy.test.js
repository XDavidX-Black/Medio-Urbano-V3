const test=require("node:test"),a=require("node:assert/strict"),{openNow,discountFor,inZone}=require("./policy");
const config={open:true,autoHours:true,hours:[{day:3,start:600,end:720,active:true}]};
test("horario Cancún",()=>{a.ok(openNow(config,new Date("2026-11-25T16:00:00Z")));a.ok(!openNow(config,new Date("2026-11-25T20:00:00Z")));a.ok(!openNow({...config,open:false},new Date("2026-11-25T16:00:00Z")))});
test("turno nocturno",()=>a.ok(openNow({open:true,autoHours:true,hours:[{day:3,start:1200,end:120,active:true}]},new Date("2026-11-26T06:00:00Z"))));
test("descuento y fecha",()=>{a.equal(discountFor({promotion:{active:true,percent:15}},10001),1500);a.equal(discountFor({promotion:{active:true,percent:15,end:"2026-11-24"}},10000,new Date("2026-11-25T16:00:00Z")),0)});
test("cobertura",()=>{const z={lat:21.16,lng:-86.85,radiusKm:3};a.ok(inZone(z,{lat:21.17,lng:-86.85}));a.ok(!inZone(z,{lat:21.26,lng:-86.85}));a.ok(!inZone(z,null))});
