// Fix: Use Firebase v8 compat API for initialization to match project's likely dependency version.
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCK25mmhfyzb80DLo_6o1nbhYIXtCVGawQ",
  authDomain: "timerprj.firebaseapp.com",
  projectId: "timerprj",
  storageBucket: "timerprj.firebasestorage.app",
  messagingSenderId: "888857813650",
  appId: "1:888857813650:web:3fb8717cd866536e5f7c4b"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Export a Firestore instance
export const db = firebase.firestore();