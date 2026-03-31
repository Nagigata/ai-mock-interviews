// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBwqB6SX0TKRCUqBgq35RCMyMPKDHmzsAc",
  authDomain: "prepwise-806e7.firebaseapp.com",
  projectId: "prepwise-806e7",
  storageBucket: "prepwise-806e7.firebasestorage.app",
  messagingSenderId: "691785866609",
  appId: "1:691785866609:web:8314d203bf254e3706aad0",
  measurementId: "G-JVPHG703ZX"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp(); 

export const auth = getAuth(app);
export const db = getFirestore(app);
