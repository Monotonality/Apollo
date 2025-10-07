import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDkADTzCPhfAd2uAZwIltfiiqbMlMo8XuM",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "apollo-20595883-a61f4.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "apollo-20595883-a61f4",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "apollo-20595883-a61f4.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "67057732331",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:67057732331:web:8b24ce1fc7c383daad0cae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connect to emulators only if explicitly enabled
// Set REACT_APP_USE_EMULATORS=true in .env.local to use emulators
if (process.env.REACT_APP_USE_EMULATORS === 'true') {
  try {
    // Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8081);
    
    // Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099');
    
    // Storage emulator
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('Connected to Firebase emulators');
  } catch (error) {
    // Emulators already connected
    console.log('Firebase emulators already connected');
  }
} else {
  console.log('Connected to Firebase production');
}

export default app;
