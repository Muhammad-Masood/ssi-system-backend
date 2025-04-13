// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import dotenv from "dotenv";
dotenv.config();

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY,
//   authDomain: "ssi-kit.firebaseapp.com",
//   projectId: "ssi-kit",
//   storageBucket: "ssi-kit.appspot.com",
//   messagingSenderId: "533598789533",
//   appId: "1:533598789533:web:68a3eb85f01cdfb705d974",
//   measurementId: "G-N9WMQRHWWJ"
// };

const firebaseConfig = {
  apiKey: "AIzaSyBTBUjJYDreDws1Y_IS_wOpyrTfKCKmrFc",
  authDomain: "ssihealth-65536.firebaseapp.com",
  projectId: "ssihealth-65536",
  storageBucket: "ssihealth-65536.firebasestorage.app",
  messagingSenderId: "819856429901",
  appId: "1:819856429901:web:734ca6ecc11713bc6f5d04",
  measurementId: "G-LPBKVCDS5R",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore(app);
