// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBuiuMTKCFL0ftPXvtDCLsn6fl8ye4T0nA",
  authDomain: "chapita-8211c.firebaseapp.com",
  projectId: "chapita-8211c",
  storageBucket: "chapita-8211c.firebasestorage.app",
  messagingSenderId: "558679081850",
  appId: "1:558679081850:web:6ca792c8ea6e6916710cc3",
  databaseURL: "https://chapita-8211c-default-rtdb.firebaseio.com" // Añade esta URL para Realtime Database
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

export default app;
