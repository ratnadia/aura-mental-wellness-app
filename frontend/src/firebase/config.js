// frontend/src/firebase/config.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6NwhrQhvaXzYH87hS-Tqzdg1611wVznY",
  authDomain: "aura-797fd.firebaseapp.com",
  projectId: "aura-797fd",
  storageBucket: "aura-797fd.firebasestorage.app",
  messagingSenderId: "250809155186",
  appId: "1:250809155186:web:62b6a093ee1af7cd238ceb",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export helpers so the rest of the app can use Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export { signInAnonymously, onAuthStateChanged };
