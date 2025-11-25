// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDocZOAuziRIZFgXPKMhoOr83K7dU5UTlw",
  authDomain: "schoolpreview.firebaseapp.com",
  projectId: "schoolpreview",
  storageBucket: "schoolpreview.firebasestorage.app",
  messagingSenderId: "736011963244",
  appId: "1:736011963244:web:5acbb26f1e50d8dae7c149",
  measurementId: "G-ESYC2DE9X8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only in browser
if (typeof window !== "undefined") {
  getAnalytics(app);
}

export default app;

