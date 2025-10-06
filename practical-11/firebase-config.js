// === Firebase SDKs (v10 modular) ===
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// === 1) Fill YOUR Firebase config here ===
const firebaseConfig = {
  apiKey: "AIzaSyAEPO0kah_8ODWOAn-o39mQpDr-BwXA56o",
  authDomain: "chatting-86f08.firebaseapp.com",
  projectId: "chatting-86f08",
  storageBucket: "chatting-86f08.firebasestorage.app",
  messagingSenderId: "962690687238",
  appId: "1:962690687238:web:7f6a7dc41a83f0f46bbe87",
  measurementId: "G-DNMNLRTT7H"
};

// === 2) Initialize Firebase and export instances ===
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };