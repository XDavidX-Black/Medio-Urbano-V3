// Replace only for a separate staging Firebase project. Never use service-account keys here.
export const settings = {
  emulator: ["localhost","127.0.0.1"].includes(location.hostname),
  firebase: {
    apiKey: "demo-key",
    authDomain: "demo-medio-urbano-v4.firebaseapp.com",
    projectId: "demo-medio-urbano-v4",
    storageBucket: "demo-medio-urbano-v4.appspot.com",
    appId: "1:123456789:web:demo"
  },
  appCheckSiteKey: "",
  region: "us-central1"
};
