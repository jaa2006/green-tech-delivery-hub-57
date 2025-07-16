
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Firebase configuration - NEW PROJECT
const firebaseConfig = {
  apiKey: "AIzaSyA4mn-UT6KikJ9CiNZMFzxnyLr6WO1wado",
  authDomain: "habisin-migrasi-database.firebaseapp.com",
  projectId: "habisin-migrasi-database", 
  storageBucket: "habisin-migrasi-database.firebasestorage.app",
  messagingSenderId: "766502992548",
  appId: "1:766502992548:web:3b036af4b9a40996524431",
  measurementId: "G-D1XH5MWQWG"
};

// Initialize Firebase with error handling
let app;
let auth;
let db;

try {
  console.log('=== FIREBASE INITIALIZATION ===');
  console.log('Project ID:', firebaseConfig.projectId);
  console.log('Auth Domain:', firebaseConfig.authDomain);
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  console.log('✅ Firebase initialized successfully');
  console.log('Auth instance:', !!auth);
  console.log('Firestore instance:', !!db);
  console.log('===============================');
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

export { auth, db };
export default app;
