// Fix: Import initializeApp directly from "firebase/app" for Firebase v9+ SDK.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxqhUmiPOCkdwDfbI8-Q6k7hyutQEIQEI",
  authDomain: "ttt1-9c767.firebaseapp.com",
  projectId: "ttt1-9c767",
  storageBucket: "ttt1-9c767.firebasestorage.app",
  messagingSenderId: "146279854885",
  appId: "1:146279854885:web:6760890c2802c9506fa0cc",
  measurementId: "G-DSL8FJRC6K"
};

// Initialize Firebase
// Fix: Call the imported initializeApp function directly.
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);