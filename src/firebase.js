// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
// Firestore import (commented out until Java is installed for emulator)
// import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
// const db = getFirestore(app); // Uncomment when Firestore emulator is needed
const functions = getFunctions(app);

// Connect to emulators in development mode
// Only connect if emulators are not already connected
const useEmulator = process.env.NODE_ENV === 'development' && 
                    process.env.REACT_APP_USE_EMULATOR !== 'false';

if (useEmulator) {
  try {
    // Connect to Auth Emulator
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    
    // Connect to Functions Emulator
    connectFunctionsEmulator(functions, "localhost", 5001);
    
    // Firestore Emulator (requires Java - uncomment when Java is installed)
    // connectFirestoreEmulator(db, "localhost", 8080);
    
    console.log("🔥 Firebase Emulators connected!");
    console.log("   - Auth: http://localhost:9099");
    console.log("   - Functions: localhost:5001");
    console.log("   - Firestore: (requires Java - not connected)");
  } catch (error) {
    // Emulators already connected or error connecting
    console.warn("⚠️ Firebase Emulator connection warning:", error.message);
  }
}

// Initialize Analytics (only in production)
let analytics = null;
if (process.env.NODE_ENV === 'production') {
  analytics = getAnalytics(app);
}

// Export services
export { app, auth, functions, analytics };
// export { db }; // Uncomment when Firestore is needed