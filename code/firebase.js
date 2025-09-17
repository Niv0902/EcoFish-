// Firebase configuration for browser environment
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Client-side Firebase configuration - Web SDK format
const firebaseConfig = {
  projectId: "ecofish-7d154",
  databaseURL: "https://ecofish-7d154-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Database
export const db = getDatabase(app);

// Test connection
console.log('Firebase initialized, database URL:', firebaseConfig.databaseURL);

export default app;