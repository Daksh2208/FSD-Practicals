import { auth, db } from './firebase-config.js';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    GoogleAuthProvider, 
    signInWithPopup 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { 
    doc, 
    setDoc, 
    getDoc, 
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// DOM refs
const authView = document.getElementById('authView');
const authTitle = document.getElementById('authTitle');
const nameInput = document.getElementById('nameInput');
const nameGroup = document.getElementById('nameGroup');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const authSubmit = document.getElementById('authSubmit');
const googleBtn = document.getElementById('googleBtn');
const authSwitch = document.getElementById('authSwitch');

let isSignup = true;
const provider = new GoogleAuthProvider();

// Auth state listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Ensure the user profile doc exists so People tab can list users
        try { await ensureUserDoc(user); } catch (e) { /* ignore */ }
        // Then redirect to the home page
        window.location.href = 'home.html';
    } else {
        // User is signed out, ensure the login form is visible
        authView.style.display = 'block';
    }
});

// Function to switch between login and signup modes
function setAuthMode(signup) {
    isSignup = signup;
    authTitle.textContent = signup ? 'Create account' : 'Welcome back';
    authSubmit.textContent = signup ? 'Sign up' : 'Sign in';
    nameGroup.style.display = signup ? 'flex' : 'none';
    authSwitch.innerHTML = signup 
        ? 'Already have an account? <a href="#" id="toLogin">Sign in</a>' 
        : "Don't have an account? <a href='#' id='toSignup'>Create one</a>";

    document.getElementById('toLogin')?.addEventListener('click', e => { e.preventDefault(); setAuthMode(false) });
    document.getElementById('toSignup')?.addEventListener('click', e => { e.preventDefault(); setAuthMode(true) });
}

// Function to create a user document in Firestore if it doesn't exist
async function ensureUserDoc(user) {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        await setDoc(ref, { 
            uid: user.uid, 
            name: user.displayName || 'Anonymous', 
            email: user.email, 
            photoURL: user.photoURL || '', 
            createdAt: serverTimestamp() 
        });
    }
}

// Event Listeners
googleBtn.addEventListener('click', async () => {
    try {
        const cred = await signInWithPopup(auth, provider);
        await ensureUserDoc(cred.user);
    } catch (e) { alert(e.message) }
});

authSubmit.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const pass = passwordInput.value.trim();
    try {
        if (isSignup) {
            const name = nameInput.value.trim() || email.split('@')[0];
            const cred = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(cred.user, { displayName: name, photoURL: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(name)}` });
            await ensureUserDoc(cred.user);
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
        }
    } catch (e) { alert(e.message) }
});

// Initialize the auth form
setAuthMode(true);