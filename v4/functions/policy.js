function timeParts(now=new Date()){
 const p=Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone:"America/Cancun",weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now).map(x=>[x.type,x.value]));
 return {day:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(p.weekday),minutes:Number(p.hour)*60+Number(p.minute),date:p.year+"-"+p.month+"-"+p.day};
}

function openNow(config,now=new Date()){
 if(config?.open!==true)return false;if(config.autoHours!==true)return true;
 const p=timeParts(now),hours=Array.isArray(config.hours)?config.hours:[];
 return hours.some(h=>{if(!h.active||!Number.isInteger(h.day)||!Number.isInteger(h.start)||!Number.isInteger(h.end)||h.start===h.end)return false;return h.end>h.start?h.day===p.day&&p.minutes>=h.start&&p.minutes<h.end:(h.day===p.day&&p.minutes>=h.start)||((h.day+1)%7===p.day&&p.minutes<h.end)});
}

function discountFor(config,subtotal,now=new Date()){
 const p=config?.promotion;if(!p||p.active!==true||!Number.isInteger(p.percent)||p.percent<1||p.percent>50)return 0;
 const d=timeParts(now).date;if(p.start&&d<p.start||p.end&&d>p.end)return 0;
 return Math.floor(subtotal*p.percent/100);
}

function distanceKm(a,b){
 const r=Math.PI/180,lat=(b.lat-a.lat)*r,lng=(b.lng-a.lng)*r;
 const h=Math.sin(lat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(lng/2)**2;
 return 6371*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,h))));
}

function inZone(zone,location){
 if(zone?.radiusKm==null)return true;
 if(!location||![zone.lat,zone.lng,zone.radiusKm,location.lat,location.lng].every(Number.isFinite)||zone.radiusKm<=0||Math.abs(zone.lat)>90||Math.abs(zone.lng)>180||Math.abs(location.lat)>90||Math.abs(location.lng)>180)return false;
 return distanceKm(location,zone)<=zone.radiusKm;
}
module.exports={timeParts,openNow,discountFor,distanceKm,inZone};
