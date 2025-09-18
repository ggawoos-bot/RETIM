// FIX: Use the Firebase compat library for initialization to resolve module resolution issues.
import firebase from 'firebase/compat/app';
// Import the Realtime Database compat library to ensure it's included.
import 'firebase/compat/database';
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCK25mmhfyzb80DLo_6o1nbhYIXtCVGawQ",
    authDomain: "timerprj.firebaseapp.com",
    projectId: "timerprj",
    storageBucket: "timerprj.appspot.com",
    messagingSenderId: "888857813650",
    appId: "1:888857813650:web:3fb8717cd866536e5f7c4b",
    // Add the databaseURL for Realtime Database
    databaseURL: "https://timerprj-default-rtdb.firebaseio.com"
};

// Initialize Firebase using the compat library, preventing re-initialization.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export the v9 Realtime Database instance. getDatabase() will use the default app initialized above.
export const db = getDatabase();
