import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAITMHOsaO0rgcA6cjJW19HnPDeN3iXmJc",
  authDomain: "boys-scoreboard.firebaseapp.com",
  databaseURL: "https://boys-scoreboard-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "boys-scoreboard",
  storageBucket: "boys-scoreboard.firebasestorage.app",
  messagingSenderId: "833386821705",
  appId: "1:833386821705:web:9513724bbe3209742d6798"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Realtime Database instance for use across the app
export const database = getDatabase(app);