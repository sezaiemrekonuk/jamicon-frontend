import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, 
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

interface FirebaseInstance {
    app: FirebaseApp;
    auth: Auth;
    db: Firestore;
    storage: FirebaseStorage;
    analytics: Analytics;
}

let firebaseInstance: FirebaseInstance | null = null;

export function initializeFirebase(): FirebaseInstance {
    if (firebaseInstance) {
        console.log("Firebase already initialized");
        return firebaseInstance;
    }

    try {
        const app = initializeApp(firebaseConfig);
        console.log("Firebase initialized");
        firebaseInstance = {
            app,
            auth: getAuth(app),
            db: getFirestore(app),
            storage: getStorage(app),
            analytics: getAnalytics(app)
        };

        return firebaseInstance;
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        throw error; 
    }
}

export function getFirebaseInstance(): FirebaseInstance {
    if (!firebaseInstance) {
        firebaseInstance = initializeFirebase();
    }
    
    return firebaseInstance;
}