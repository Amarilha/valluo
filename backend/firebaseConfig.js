
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {getDatabase, ref, get  } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCwVKAi3b6Z4JIbR_G7ensn9EFDv141KX4",
    authDomain: "sw-valuo.firebaseapp.com",
    databaseURL: "https://sw-valuo-default-rtdb.firebaseio.com",
    projectId: "sw-valuo",
    storageBucket: "sw-valuo.firebasestorage.app",
    messagingSenderId: "450626458483",
    appId: "1:450626458483:web:d1bf0e934a524ef8436b06",
    measurementId: "G-C03JEM0HRQ"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  export { app, db, getDatabase, ref, get };