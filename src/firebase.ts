import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkADTzCPhfAd2uAZwIltfiiqbMlMo8XuM",
  authDomain: "apollo-20595883-a61f4.firebaseapp.com",
  projectId: "apollo-20595883-a61f4",
  storageBucket: "apollo-20595883-a61f4.firebasestorage.app",
  messagingSenderId: "67057732331",
  appId: "1:67057732331:web:8b24ce1fc7c383daad0cae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connect to emulators in development (DISABLED - using production Firebase)
// if (process.env.NODE_ENV === 'development') {
//   try {
//     // Firestore emulator
//     connectFirestoreEmulator(db, 'localhost', 8081);
//     
//     // Auth emulator
//     connectAuthEmulator(auth, 'http://localhost:9099');
//     
//     // Storage emulator
//     connectStorageEmulator(storage, 'localhost', 9199);
//   } catch (error) {
//     // Emulators already connected
//     console.log('Firebase emulators already connected');
//   }
// }

export default app;
