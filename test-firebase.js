// Test script to add sample committee data to Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDkADTzCPhfAd2uAZwIltfiiqbMlMo8XuM",
  authDomain: "apollo-20595883-a61f4.firebaseapp.com",
  projectId: "apollo-20595883-a61f4",
  storageBucket: "apollo-20595883-a61f4.firebasestorage.app",
  messagingSenderId: "67057732331",
  appId: "1:67057732331:web:8b24ce1fc7c383daad0cae"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addSampleCommittees() {
  try {
    console.log('Adding sample committees...');
    
    const sampleCommittees = [
      {
        COMM_ID: 'tech-committee',
        COMM_NAME: 'Technology Committee',
        COMM_DESCRIPTION: 'Manages technology infrastructure and digital initiatives for the organization.',
        CHAIR_ID: null,
        VICE_CHAIR_ID: null,
        COMM_IS_ACTIVE: true,
        COMM_TIMESTAMP: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        COMM_ID: 'events-committee',
        COMM_NAME: 'Events Committee',
        COMM_DESCRIPTION: 'Organizes and manages organizational events and activities.',
        CHAIR_ID: null,
        VICE_CHAIR_ID: null,
        COMM_IS_ACTIVE: true,
        COMM_TIMESTAMP: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    for (const committee of sampleCommittees) {
      const docRef = await addDoc(collection(db, 'committee'), committee);
      console.log('Added committee with ID:', docRef.id);
    }
    
    console.log('Sample committees added successfully!');
  } catch (error) {
    console.error('Error adding committees:', error);
  }
}

addSampleCommittees();

