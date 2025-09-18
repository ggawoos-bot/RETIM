// FIX: Use Firebase v9 syntax.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


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
// FIX: Use Firebase v9 initialization syntax.
const app = initializeApp(firebaseConfig);
// FIX: Use Firebase v9 firestore export.
export const db = getFirestore(app);
