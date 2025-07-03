import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getEvn } from "./getEnv";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: getEvn("VITE_FIREBASE_API"),
  authDomain: "raw-words-db.firebaseapp.com",
  projectId: "raw-words-db",
  storageBucket: "raw-words-db.firebasestorage.app",
  messagingSenderId: "288227745289",
  appId: "1:288227745289:web:7a07b05a79578682f322d8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
