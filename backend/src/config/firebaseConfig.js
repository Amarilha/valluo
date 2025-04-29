import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword,createUserWithEmailAndPassword,signInWithPopup, GoogleAuthProvider, OAuthProvider,signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, query, where, deleteDoc,collection, getDocs,addDoc } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode ='PT-br'
const provider = new GoogleAuthProvider();
const providerMicrosoft = new OAuthProvider('microsoft.com')
const db = getFirestore(app);


export { app, auth,db,signOut,signInWithEmailAndPassword,createUserWithEmailAndPassword,GoogleAuthProvider,provider,signInWithPopup,providerMicrosoft,OAuthProvider, getFirestore, doc, setDoc, getDoc, query, where, deleteDoc,collection, getDocs, addDoc};