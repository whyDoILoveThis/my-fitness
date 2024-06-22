// lib/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBb7Aw6f1-1927GsE0bi7hm2yEevhEuViM",
    authDomain: "illtellmeallboutit.firebaseapp.com",
    projectId: "illtellmeallboutit",
    storageBucket: "illtellmeallboutit.appspot.com",
    messagingSenderId: "889575090386",
    appId: "1:889575090386:web:5de30c76efab0d2388250b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
