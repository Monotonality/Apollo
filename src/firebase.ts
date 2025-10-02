import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  // These will be replaced with actual config when deploying to production
  apiKey: "demo-api-key",
  authDomain: "apollo-ugdc-demo.firebaseapp.com",
  projectId: "apollo-ugdc-demo",
  storageBucket: "apollo-ugdc-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  try {
    // Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8081);
    
    // Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099');
    
    // Storage emulator
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    // Emulators already connected
    console.log('Firebase emulators already connected');
  }
}

export default app;
