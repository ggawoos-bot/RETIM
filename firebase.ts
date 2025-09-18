// fix: Switched to Firebase v8 'compat' imports to resolve initialization error.
import firebase from 'firebase/app';
import 'firebase/database';

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

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
export const db = firebase.database();
