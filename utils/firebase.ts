import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxzteYa2MyZw_gRgDYctYTtrlrIWv92O0",
  authDomain: "arnet-qcu-a0f45.firebaseapp.com",
  projectId: "arnet-qcu-a0f45",
  storageBucket: "arnet-qcu-a0f45.firebasestorage.app",
  messagingSenderId: "669840688035",
  appId: "1:669840688035:web:0154a75f457ad0c6fa5016",
  measurementId: "G-R6JCDHR9N8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };