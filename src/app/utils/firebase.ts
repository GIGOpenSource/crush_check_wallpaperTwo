// src/ts/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDDLnb-3H4TgA2Gk3IGL8N4s4vfX9DSMvw",
  authDomain: "mark-wallpapers---hd.firebaseapp.com",
  projectId: "mark-wallpapers---hd",
  storageBucket: "mark-wallpapers---hd.firebasestorage.app",
  messagingSenderId: "577266569670",
  appId: "1:577266569670:web:8f3dba14d38b568ce5a2c7",
  measurementId: "G-NDFBS388DW"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);