
// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp, getApps } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, Analytics } from "firebase/analytics";

// Firebase configuration
// TODO: Replace with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFETzixGJ9_-UPAzJI96ZlF4sfFUzrI7k",
  authDomain: "ceka-app.firebaseapp.com",
  projectId: "ceka-app",
  storageBucket: "ceka-app.appspot.com",
  messagingSenderId: "710537315921",
  appId: "1:710537315921:android:47847d8ad67fcc4b9fda70"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

// Initialize Firebase only on the client side
if (typeof window !== 'undefined') {
  // Initialize Firebase
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Analytics only works in the browser
    if (process.env.NODE_ENV === 'production') {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  // Server-side initialization will be handled differently
  console.warn('Firebase is not initialized server-side');
}

export { app, auth, db, storage, analytics };
