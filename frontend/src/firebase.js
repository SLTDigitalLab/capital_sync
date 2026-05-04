// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";


// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDFYt7LX0slwe-p16pMmXQiuOaE7W9vHqk",
  authDomain: "wealth-track-6b69a.firebaseapp.com",
  projectId: "wealth-track-6b69a",
  storageBucket: "wealth-track-6b69a.firebasestorage.app",
  messagingSenderId: "28913927256",
  appId: "1:28913927256:web:2ced9b307d7627c283b62d",
  measurementId: "G-X55TV1R0P6"
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
