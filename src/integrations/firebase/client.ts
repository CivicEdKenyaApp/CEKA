
// Firebase SDK imports
import { initializeApp, FirebaseApp, getApps } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getMessaging, Messaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { firebaseConfig } from './config';

// Firebase instances
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;
let messaging: Messaging | null = null;

// Initialize Firebase only on the client side
if (typeof window !== 'undefined') {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Analytics only works in the browser and production
    if (window.location.hostname !== 'localhost') {
      analytics = getAnalytics(app);
    }

    // Initialize Firebase Cloud Messaging
    isSupported().then((supported) => {
      if (supported) {
        messaging = getMessaging(app);
        console.log('[Firebase] Cloud Messaging initialized');
      } else {
        console.warn('[Firebase] Cloud Messaging not supported in this browser');
      }
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn('Firebase is not initialized server-side');
}

/**
 * Request permission and get FCM token for push notifications
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Get VAPID key from environment
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('VITE_FIREBASE_VAPID_KEY not configured');
      return null;
    }

    const token = await getToken(messaging, { vapidKey });
    console.log('[Firebase] FCM Token received:', token.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Subscribe to foreground messages
 */
export function onForegroundMessage(callback: (payload: any) => void): () => void {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return () => { };
  }

  return onMessage(messaging, (payload) => {
    console.log('[Firebase] Foreground message received:', payload);
    callback(payload);
  });
}

export { app, auth, db, storage, analytics, messaging };

