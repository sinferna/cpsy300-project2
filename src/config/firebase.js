import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAzD6Jit1HrsnFExV2XKrrnnfOFpKd9frA",
  authDomain: "cpsy300-project3-auth.firebaseapp.com",
  projectId: "cpsy300-project3-auth",
  storageBucket: "cpsy300-project3-auth.firebasestorage.app",
  messagingSenderId: "1065219438050",
  appId: "1:1065219438050:web:a4b2aedf9fc9dee836f5bb",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
