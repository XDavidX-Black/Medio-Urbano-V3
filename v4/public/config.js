// Public Web SDK configuration reused from V3; not an administrative credential.
// Keep liveEnabled false until combined rules, App Check and v4 functions are deployed.
const emulator=["localhost","127.0.0.1"].includes(location.hostname);
export const settings={
 emulator,
 liveEnabled:false,
 firebase:emulator?{apiKey:"demo-key",authDomain:"demo-medio-urbano-v4.firebaseapp.com",projectId:"demo-medio-urbano-v4",storageBucket:"demo-medio-urbano-v4.appspot.com",appId:"1:123456789:web:demo"}:{
  "apiKey": "AIzaSyBpUcRZLflzc6PFl0DsqtUHRlwWxwB83Qs",
  "authDomain": "medio-urbano.firebaseapp.com",
  "projectId": "medio-urbano",
  "storageBucket": "medio-urbano.firebasestorage.app",
  "messagingSenderId": "6304304662",
  "appId": "1:6304304662:web:4b3f43e71d190d03e92f37"
},
 appCheckSiteKey:"",
 region:"us-central1"
};
