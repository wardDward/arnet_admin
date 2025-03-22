import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBE4v3PwQRMahn_WopK_G-E97MtaPOdEYA",
  authDomain: "arnet-f6241.firebaseapp.com",
  projectId: "arnet-f6241",
  storageBucket: "arnet-f6241.firebasestorage.app",
  messagingSenderId: "814746305822",
  appId: "1:814746305822:web:d7b09fac2f51f27f30750f",
  measurementId: "G-XT3ED5RGPL",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 

export { app, auth, db };
