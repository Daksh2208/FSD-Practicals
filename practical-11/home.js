import { auth, db } from './firebase-config.js';
import { 
    onAuthStateChanged, 
    signOut 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { 
    doc, 
    setDoc, 
    getDoc, 
    addDoc, 
    collection, 
    query, 
    getDocs, 
    serverTimestamp, 
    onSnapshot, 
    orderBy, 
    updateDoc 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// DOM refs
const appView = document.getElementById('appView');
const meName = document.getElementById('meName');
const meEmail = document.getElementById('meEmail');
const meAvatar = document.getElementById('meAvatar');

const recentList = document.getElementById('recentList');
const userSearch = document.getElementById('userSearch');
const inviteBtn = document.getElementById('inviteBtn');
const navLogout = document.getElementById('navLogout');
const navChats = document.getElementById('navChats');
const navPeople = document.getElementById('navPeople');

const chatTitle = document.getElementById('chatTitle');
const chatSub = document.getElementById('chatSub');
const messagesEl = document.getElementById('messages');
const composer = document.getElementById('composer');
const emptyState = document.getElementById('emptyState');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const toggleSidebar = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');

let activeChatId = null;
let messagesUnsub = null; // To clean up real-time listener

// Auth state listener to protect the page
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, show the app and load their data
        appView.style.display = 'grid'; // Use grid to match CSS
        meName.textContent = user.displayName || 'Anonymous';
        meEmail.textContent = user.email || '';
        meAvatar.src = user.photoURL || `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(user.uid)}`;
        loadRecentChats(user.uid);
    } else {
        // No user is signed in, redirect to the login page
        window.location.href = 'index.html';
    }
});

// Sign out
navLogout.addEventListener('click', () => signOut(auth));
toggleSidebar.addEventListener('click', () => sidebar.classList.toggle('open'));

// Tabs: Recents vs People
navChats?.addEventListener('click', async () => {
    navChats.classList.add('active');
    navPeople?.classList.remove('active');
    const me = auth.currentUser; if (!me) return;
    recentList.innerHTML = '';
    loadRecentChats(me.uid);
});

navPeople?.addEventListener('click', async () => {
    navPeople.classList.add('active');
    navChats?.classList.remove('active');
    const me = auth.currentUser; if (!me) return;
    try {
        const usersRef = collection(db, 'users');
        const qs = await getDocs(usersRef);
        const items = qs.docs
            .map(d => d.data())
            .filter(u => u.uid !== me.uid)
            .slice(0, 50);
        renderPeople(items);
        if (items.length === 0) {
            recentList.innerHTML = '<div class="muted" style="padding:8px">No people yet. Ask your friend to log in once, or check Firestore rules.</div>';
        }
    } catch (e) {
        alert('Failed to load people: ' + (e?.message || e));
    }
});

// Helper Functions
function debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) } }
function escapeHtml(s) { return s?.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])) }
function timeAgo(date) { const d = (typeof date === 'number') ? new Date(date) : date; const diff = Math.floor((Date.now() - d.getTime()) / 1000); if (diff < 60) return diff + "s"; if (diff < 3600) return Math.floor(diff / 60) + "m"; if (diff < 86400) return Math.floor(diff / 3600) + "h"; return Math.floor(diff / 86400) + "d" }
function composeChatId(a, b) { return a < b ? `${a}_${b}` : `${b}_${a}` }


// Search & people listing
userSearch.addEventListener('input', debounce(async (e) => {
    // This logic can be copied directly from the original file
    const term = e.target.value.trim().toLowerCase();
    const me = auth.currentUser;
    if(!me) return;
    const usersRef = collection(db, 'users');
    let q;
    if(term){
      const qs = await getDocs(usersRef);
      const items = qs.docs.map(d=>d.data()).filter(u=>u.uid!==me.uid && ((u.name||'').toLowerCase().includes(term) || (u.email||'').toLowerCase().includes(term)));
      renderPeople(items);
    }else{
      // To prevent loading all users, maybe just clear results or show recent
      recentList.innerHTML = ''; // Clear search results
      loadRecentChats(me.uid); // And reload recent chats
    }
}, 300));

function renderPeople(users) {
    // Clear recent chats to show search results
    recentList.innerHTML = ''; 
    const list = document.createDocumentFragment();
    users.forEach(u => {
        const row = document.createElement('div');
        row.className = 'chat-row';
        row.innerHTML = `<img src="${u.photoURL || `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(u.name || u.uid)}`}"><div><div class='name'>${escapeHtml(u.name || 'User')}</div><div class='last'>${escapeHtml(u.email || '')}</div></div><div><button class='btn'>Chat</button></div>`;
        row.querySelector('button').addEventListener('click', () => startChatWith(u.uid));
        list.appendChild(row);
    });
    recentList.appendChild(list);
}


// Chat functionality
function loadRecentChats(uid) {
    const ucRef = collection(db, 'userChats', uid, 'items');
    const qy = query(ucRef, orderBy('updatedAt', 'desc'));
    onSnapshot(qy, (qs) => {
        recentList.innerHTML = '';
        qs.forEach(docu => {
            const c = docu.data();
            const row = document.createElement('div');
            row.className = 'chat-row';
            row.dataset.chatId = c.chatId;
            row.innerHTML = `
          <img src="${c.otherPhoto || `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(c.otherUid)}`}" alt="pfp">
          <div><div class="name">${escapeHtml(c.otherName || 'User')}</div><div class="last">${escapeHtml(c.lastMessage || 'Say hi 👋')}</div></div>
          <div class="muted">${timeAgo(c.updatedAt?.toDate?.() || new Date())}</div>`;
            row.addEventListener('click', () => openChat(c.chatId, { uid: c.otherUid, name: c.otherName, photo: c.otherPhoto }));
            recentList.appendChild(row);
        });
    });
}

async function startChatWith(otherUid) {
    const me = auth.currentUser;
    if (!me || me.uid === otherUid) return;
    try {
        const chatId = composeChatId(me.uid, otherUid);
        const chatRef = doc(db, 'chats', chatId);
        // Write without pre-reading to satisfy rules for create
        await setDoc(chatRef, { chatId, participants: [me.uid, otherUid], createdAt: serverTimestamp(), updatedAt: serverTimestamp(), lastMessage: '' }, { merge: true });

        const other = await getDoc(doc(db, 'users', otherUid));
        const meUser = await getDoc(doc(db, 'users', me.uid));

        await setDoc(doc(db, 'userChats', me.uid, 'items', chatId), {
            chatId, otherUid, otherName: other.data()?.name || 'User', otherPhoto: other.data()?.photoURL || '', lastMessage: '', updatedAt: serverTimestamp()
        }, { merge: true });
        await setDoc(doc(db, 'userChats', otherUid, 'items', chatId), {
            chatId, otherUid: me.uid, otherName: meUser.data()?.name || 'User', otherPhoto: meUser.data()?.photoURL || '', lastMessage: '', updatedAt: serverTimestamp()
        }, { merge: true });

        openChat(chatId, { uid: otherUid, name: other.data()?.name, photo: other.data()?.photoURL });
    } catch (e) {
        alert('Failed to start chat: ' + (e?.message || e));
    }
}

function openChat(chatId, other) {
    activeChatId = chatId;
    chatTitle.textContent = other?.name || 'Chat';
    chatSub.textContent = other?.email || '';
    emptyState.hidden = true; composer.hidden = false; messagesEl.innerHTML = '';
    sidebar.classList.remove('open');

    if (messagesUnsub) messagesUnsub();
    const msgsRef = collection(db, 'chats', chatId, 'messages');
    const qy = query(msgsRef, orderBy('createdAt', 'asc'));
    messagesUnsub = onSnapshot(qy, (qs) => {
        messagesEl.innerHTML = '';
        qs.forEach(d => {
            const m = d.data();
            const isMe = m.senderId === auth.currentUser?.uid;
            const div = document.createElement('div');
            div.className = `bubble ${isMe ? 'me' : 'you'}`;
            div.textContent = m.text;
            messagesEl.appendChild(div);
        });
        messagesEl.scrollTop = messagesEl.scrollHeight;
    });
}

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !activeChatId) return;
    const me = auth.currentUser; if (!me) return;
    try {
        messageInput.value = '';
        const msgsRef = collection(db, 'chats', activeChatId, 'messages');
        await addDoc(msgsRef, { text, senderId: me.uid, createdAt: serverTimestamp() });
        
        const chatRef = doc(db, 'chats', activeChatId);
        await updateDoc(chatRef, { lastMessage: text, updatedAt: serverTimestamp() });

        const [a, b] = activeChatId.split('_');
        const otherUid = me.uid === a ? b : a;
        await updateDoc(doc(db, 'userChats', me.uid, 'items', activeChatId), { lastMessage: text, updatedAt: serverTimestamp() });
        await updateDoc(doc(db, 'userChats', otherUid, 'items', activeChatId), { lastMessage: text, updatedAt: serverTimestamp() });
    } catch (e) {
        alert('Failed to send: ' + (e?.message || e));
    }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

// Invite button
inviteBtn.addEventListener('click', () => {
    const url = location.origin; // Use origin for a cleaner link
    location.href = `mailto:?subject=Join me on Chatter&body=Let’s chat here: ${url}`;
});