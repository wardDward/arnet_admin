import { defineNuxtPlugin } from "#app";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export default defineNuxtPlugin((nuxtApp) => {
  const firebaseConfig = {
    apiKey: "AIzaSyDxzteYa2MyZw_gRgDYctYTtrlrIWv92O0",
    authDomain: "arnet-qcu-a0f45.firebaseapp.com",
    projectId: "arnet-qcu-a0f45",
    storageBucket: "arnet-qcu-a0f45.firebasestorage.app",
    messagingSenderId: "669840688035",
    appId: "1:669840688035:web:0154a75f457ad0c6fa5016",
    measurementId: "G-R6JCDHR9N8"
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

