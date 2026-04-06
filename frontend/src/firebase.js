// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "beasiswa-nusantara.firebaseapp.com",
  projectId: "beasiswa-nusantara",
  storageBucket: "beasiswa-nusantara.firebasestorage.app",
  messagingSenderId: "773153044606",
  appId: "1:773153044606:web:ef1629443fa3bc181c802f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);