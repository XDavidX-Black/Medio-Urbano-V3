var socialData={};

function initSocial(){
  loadSocial();
}

function loadSocial(){
  if(typeof firebase==="undefined"||!firebase.firestore)return;
  firebase.firestore().collection("config").doc("social").get()
    .then(function(doc){
      if(!doc.exists)return;
      var d=doc.data();
      socialData=d;
      document.getElementById("socialFacebook").value=d.facebook||"";
      document.getElementById("socialInstagram").value=d.instagram||"";
      document.getElementById("socialTiktok").value=d.tiktok||"";
      document.getElementById("socialYoutube").value=d.youtube||"";
      document.getElementById("socialWhatsapp").value=d.whatsapp||"";
      document.getElementById("socialEmail").value=d.email||"";
      document.getElementById("socialWebsite").value=d.website||"";
      document.getElementById("socialPhone").value=d.phone||"";
      document.getElementById("socialAddress").value=d.address||"";
      document.getElementById("socialHours").value=d.hours||"";
    }).catch(function(){});
}

function guardarSocial(){
  var data={
    facebook:document.getElementById("socialFacebook").value.trim(),
    instagram:document.getElementById("socialInstagram").value.trim(),
    tiktok:document.getElementById("socialTiktok").value.trim(),
    youtube:document.getElementById("socialYoutube").value.trim(),
    whatsapp:document.getElementById("socialWhatsapp").value.trim(),
    email:document.getElementById("socialEmail").value.trim(),
    website:document.getElementById("socialWebsite").value.trim(),
    phone:document.getElementById("socialPhone").value.trim(),
    address:document.getElementById("socialAddress").value.trim(),
    hours:document.getElementById("socialHours").value.trim(),
    updatedAt:new Date().toISOString()
  };
  if(typeof firebase==="undefined"||!firebase.firestore){
    alert("Firebase no disponible");return;
  }
  firebase.firestore().collection("config").doc("social").set(data,{merge:true})
    .then(function(){
      socialData=data;
      alert("Redes sociales guardadas correctamente");
      if(typeof logAdminAction==="function"){
        logAdminAction("config","guardar_social","Redes sociales actualizadas");
      }
    }).catch(function(e){
      alert("Error al guardar: "+e.message);
    });
}

function restaurarSocial(){
  if(typeof firebase==="undefined"||!firebase.firestore){
    alert("Firebase no disponible");return;
  }
  firebase.firestore().collection("config").doc("social").get()
    .then(function(doc){
      if(!doc.exists){
        document.getElementById("socialFacebook").value="";
        document.getElementById("socialInstagram").value="";
        document.getElementById("socialTiktok").value="";
        document.getElementById("socialYoutube").value="";
        document.getElementById("socialWhatsapp").value="";
        document.getElementById("socialEmail").value="";
        document.getElementById("socialWebsite").value="";
        document.getElementById("socialPhone").value="";
        document.getElementById("socialAddress").value="";
        document.getElementById("socialHours").value="";
        socialData={};
        return;
      }
      var d=doc.data();
      socialData=d;
      document.getElementById("socialFacebook").value=d.facebook||"";
      document.getElementById("socialInstagram").value=d.instagram||"";
      document.getElementById("socialTiktok").value=d.tiktok||"";
      document.getElementById("socialYoutube").value=d.youtube||"";
      document.getElementById("socialWhatsapp").value=d.whatsapp||"";
      document.getElementById("socialEmail").value=d.email||"";
      document.getElementById("socialWebsite").value=d.website||"";
      document.getElementById("socialPhone").value=d.phone||"";
      document.getElementById("socialAddress").value=d.address||"";
      document.getElementById("socialHours").value=d.hours||"";
      alert("Datos restaurados desde Firestore");
    }).catch(function(e){
      alert("Error al restaurar: "+e.message);
    });
}
