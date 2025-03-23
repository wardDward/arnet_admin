import { defineNuxtPlugin } from "#app";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export default defineNuxtPlugin((nuxtApp) => {
  const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "arnet-f6241.firebaseapp.com",
    projectId: "arnet-f6241",
    storageBucket: "arnet-f6241.appspot.com",
    messagingSenderId: "814746305822",
    appId: "1:814746305822:web:d7b09fac2f51f27f30750f",
    measurementId: "G-XT3ED5RGPL",
  };

  // Prevent duplicate Firebase initialization
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  const auth = getAuth(app);
  const db = getFirestore(app);

  // Ensure auth state persists after reload
  setPersistence(auth, browserLocalPersistence);

  // Wait for Firebase to restore session before proceeding
  const userPromise = new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve(user);
    });
  });

  nuxtApp.provide("auth", auth);
  nuxtApp.provide("db", db);
  nuxtApp.provide("userPromise", userPromise);
});
