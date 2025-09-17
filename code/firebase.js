// Firebase configuration for browser environment
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Minimal Firebase configuration with database URL
const firebaseConfig = {
  databaseURL: "https://ecofish-7d154-default-rtdb.firebaseio.com",
  projectId: "ecofish-7d154"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Database
export const db = getDatabase(app);

export default app;