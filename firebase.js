// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlP6ZdVtR6pQfn5xtyTxz98K_IMXcJwzA",
  authDomain: "paypysburgersapp-1a8ed.firebaseapp.com",
  projectId: "paypysburgersapp-1a8ed",
  storageBucket: "paypysburgersapp-1a8ed.firebasestorage.app",
  messagingSenderId: "538072887394",
  appId: "1:538072887394:web:ee0fec620d348d00c9e13b",
  measurementId: "G-1N6M30EKR9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
