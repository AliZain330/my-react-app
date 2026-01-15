// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth, connectAuthEmulator, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Debug: Log environment variables to see what's being loaded
console.log('🔍 Environment Variables Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('All REACT_APP_ variables:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
console.log('REACT_APP_API_KEY:', process.env.REACT_APP_API_KEY ? `✅ Found (${process.env.REACT_APP_API_KEY.substring(0, 10)}...)` : '❌ Missing');
console.log('REACT_APP_PROJECT_ID:', process.env.REACT_APP_PROJECT_ID ? `✅ Found (${process.env.REACT_APP_PROJECT_ID})` : '❌ Missing');
console.log('REACT_APP_APP_ID:', process.env.REACT_APP_APP_ID ? `✅ Found (${process.env.REACT_APP_APP_ID.substring(0, 20)}...)` : '❌ Missing');

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

// Validate required Firebase config values
let app, auth, db, functions, appCheck;
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;

if (!isFirebaseConfigured) {
  const missingVars = [];
  if (!firebaseConfig.apiKey) missingVars.push('REACT_APP_API_KEY');
  if (!firebaseConfig.projectId) missingVars.push('REACT_APP_PROJECT_ID');
  if (!firebaseConfig.appId) missingVars.push('REACT_APP_APP_ID');
  
  console.warn('⚠️ Firebase configuration warning: Missing required environment variables:', missingVars.join(', '));
  console.warn('⚠️ Firebase features (Auth, Firestore) will not work until .env file is configured.');
  console.warn('⚠️ Please check your .env file and ensure all Firebase config values are set.');
  console.warn('⚠️ Then restart your development server with: npm start');
  
  // Create dummy objects to prevent crashes
  app = null;
  auth = null;
  db = null;
  functions = null;
  appCheck = null;
} else {
  // Initialize Firebase
  try {
    app = initializeApp(firebaseConfig);
    
    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    functions = getFunctions(app);

    // Initialize App Check (requires reCAPTCHA v3 site key)
    if (process.env.REACT_APP_RECAPTCHA_SITE_KEY) {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshedEnabled: true
      });
    } else {
      console.warn('⚠️ App Check not initialized: Missing REACT_APP_RECAPTCHA_SITE_KEY');
      appCheck = null;
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    app = null;
    auth = null;
    db = null;
    functions = null;
    appCheck = null;
  }
}

// Connect to emulators in development mode (only if Firebase is configured)
if (isFirebaseConfigured && app && auth && db && functions) {
  const useEmulator = process.env.NODE_ENV === 'development' &&
                      process.env.REACT_APP_USE_EMULATOR === 'true';

  if (useEmulator) {
    try {
      // Connect to Auth Emulator
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
      
      // Connect to Functions Emulator
      connectFunctionsEmulator(functions, "localhost", 5001);
      
      // Connect to Firestore Emulator (requires Java - comment out if not using emulator)
      try {
        connectFirestoreEmulator(db, "localhost", 8080);
        console.log("🔥 Firebase Emulators connected!");
        console.log("   - Auth: http://localhost:9099");
        console.log("   - Functions: localhost:5001");
        console.log("   - Firestore: localhost:8080");
      } catch (firestoreError) {
        // Firestore emulator not running, use production Firestore
        console.log("🔥 Firebase Emulators connected!");
        console.log("   - Auth: http://localhost:9099");
        console.log("   - Functions: localhost:5001");
        console.log("   - Firestore: Using production database (emulator not available)");
      }
    } catch (error) {
      // Emulators already connected or error connecting
      console.warn("⚠️ Firebase Emulator connection warning:", error.message);
    }
  } else {
    console.log("🔥 Firebase initialized (production mode)");
    console.log("   - Firestore: Connected to production database");
  }
}

// Ensure anonymous sign-in and keep auth state in sync
if (auth) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      signInAnonymously(auth).catch((error) => {
        console.error('❌ Anonymous sign-in error:', error);
      });
    }
  });
}

// Initialize Analytics (only in production)
let analytics = null;
if (process.env.NODE_ENV === 'production' && app) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error('❌ Analytics initialization error:', error);
    analytics = null;
  }
}

// Export services
export { app, auth, functions, analytics, db, appCheck };