"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),{normalize,quote,transition}=require("./core");
const sample={"token":"sample-token-123456","items":[{"id":"burger","qty":2,"extras":["cheese"]}],"contact":{"name":"Prueba","phone":"9981234567","address":"Domicilio ficticio"},"payment":"Efectivo","zone":"centro","expectedTotal":33000},catalog={"burger":{"name":"Burger","brand":"burgers","active":true,"priceCents":14000,"extras":[{"id":"cheese","name":"Queso","active":true,"priceCents":1000}]}},config={"open":true,"minCents":10000,"zones":[{"id":"centro","name":"Centro","active":true,"feeCents":3000}]};
test("precio y extras del catálogo",()=>assert.equal(quote(normalize(sample),catalog,config).totalCents,33000));
test("rechaza importe alterado",()=>assert.throws(()=>quote(normalize({...sample,expectedTotal:1}),catalog,config)));
test("rechaza producto inactivo",()=>assert.throws(()=>quote(normalize(sample),{burger:{...catalog.burger,active:false}},config)));
test("rechaza zona desconocida",()=>assert.throws(()=>quote(normalize({...sample,zone:"otra"}),catalog,config)));
test("rechaza tienda cerrada",()=>assert.throws(()=>quote(normalize(sample),catalog,{...config,open:false})));
test("rechaza cantidad negativa",()=>assert.throws(()=>normalize({...sample,items:[{id:"burger",qty:-1,extras:[]}]})));
test("rechaza extras duplicados",()=>assert.throws(()=>normalize({...sample,items:[{id:"burger",qty:1,extras:["cheese","cheese"]}]})));
test("rechaza extras desconocidos",()=>assert.throws(()=>quote(normalize({...sample,items:[{id:"burger",qty:2,extras:["x"]}]}),catalog,config)));
test("transiciones permitidas y finales",()=>{assert.ok(transition("Pendiente","Preparando"));assert.ok(!transition("Entregado","Pendiente"))});
test("rechaza teléfono inválido",()=>assert.throws(()=>normalize({...sample,contact:{...sample.contact,phone:"abc"}})));

test("marca nueva registrada permite pedidos",()=>assert.equal(quote(normalize(sample),{burger:{...catalog.burger,brand:"brand-tacos"}},config,new Date(),{"brand-tacos":{name:"Urban Tacos",active:true}}).items[0].brandName,"Urban Tacos"));
test("marca nueva no registrada rechazada",()=>assert.throws(()=>quote(normalize(sample),{burger:{...catalog.burger,brand:"brand-tacos"}},config)));
test("marca original desactivada rechazada",()=>assert.throws(()=>quote(normalize(sample),catalog,config,new Date(),{burgers:{name:"Burgers",active:false}})));
