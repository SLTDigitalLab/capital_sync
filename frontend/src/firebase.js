// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";


// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBLt7kNXeC9ka-D6VV5f0hLX3e22Q0xbWE",
  authDomain: "capital-sync-5580b.firebaseapp.com",
  projectId: "capital-sync-5580b",
  storageBucket: "capital-sync-5580b.firebasestorage.app",
  messagingSenderId: "267105315056",
  appId: "1:267105315056:web:ac5983acc357ebebf6ba35",
  measurementId: "G-3BG554ZM0E"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

//Sign in Functions
export const signInWithEmailFunc = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUpwithEmailFunc = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);
//Sign Up Function

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithGithub = () => signInWithPopup(auth, githubProvider);
export const logout = () => signOut(auth);
