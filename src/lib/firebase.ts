import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDTPYCOB9GXiMs6xoSBXiHdG4MbdCe19IM",
  authDomain: "totemic-purpose-zp497.firebaseapp.com",
  projectId: "totemic-purpose-zp497",
  storageBucket: "totemic-purpose-zp497.firebasestorage.app",
  messagingSenderId: "433415823852",
  appId: "1:433415823852:web:1916cee092f7043bad60c9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Cloud Firestore with the custom database ID
export const db = getFirestore(app, "ai-studio-xauusdtracker-63d81ccb-9422-44f4-8b18-4d61166642e7");

export default app;
