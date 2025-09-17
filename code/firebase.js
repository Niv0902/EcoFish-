require('dotenv').config();

const firebaseConfig = JSON.parse(
  Buffer.from(process.env.VITE_FIREBASE_CONFIG_BASE64, 'base64').toString('utf-8')
);

console.log("Firebase Config Loaded:", firebaseConfig);