import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDxvSOTQBsy3Kl-pP34MxUDdGWsmUeiMyw",
  authDomain: "chat-wave-711fc.firebaseapp.com",
  projectId: "chat-wave-711fc",
  storageBucket: "chat-wave-711fc.firebasestorage.app",
  messagingSenderId: "556719208115",
  appId: "1:556719208115:web:47cb316cde725c134422c6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ADMIN
const ADMIN_EMAIL = "aladehabeeb213@gmail.com";

// STATE
let currentUserChat = null;

// AUTH
window.signup = () =>
  createUserWithEmailAndPassword(auth, email.value, password.value);

window.login = () =>
  signInWithEmailAndPassword(auth, email.value, password.value);

// LOGIN STATE
onAuthStateChanged(auth, (user) => {
  if (user) {
    authBox.style.display = "none";
    loadUsers();
  }
});

// LOAD USERS (CHAT LIST)
function loadUsers() {
  const q = query(collection(db, "messages"), orderBy("time"));

  onSnapshot(q, snap => {
    const users = new Set();
    userList.innerHTML = "";

    snap.forEach(d => {
      const data = d.data();
      if (data.email !== auth.currentUser.email) {
        users.add(data.email);
      }
    });

    users.forEach(email => {
      const div = document.createElement("div");
      div.className = "user";
      div.innerText = email;

      div.onclick = () => openChat(email);

      userList.appendChild(div);
    });
  });
}

// OPEN CHAT
window.openChat = (email) => {
  currentUserChat = email;

  userList.style.display = "none";
  chatBox.style.display = "block";

  loadChat(email);
};

// LOAD CHAT
function loadChat(email) {
  const q = query(collection(db, "messages"), orderBy("time"));

  onSnapshot(q, snap => {
    chatBox.innerHTML = "";

    snap.forEach(d => {
      const data = d.data();

      if (
        (data.email === auth.currentUser.email && data.to === email) ||
        (data.email === email && data.to === auth.currentUser.email)
      ) {
        const div = document.createElement("div");

        div.className = "box " +
          (data.email === auth.currentUser.email ? "me" : "other");

        div.innerText = data.email + ": " + data.text;

        chatBox.appendChild(div);
      }
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// SEND MESSAGE
window.sendMessage = async () => {
  if (!msg.value || !currentUserChat) return;

  await addDoc(collection(db, "messages"), {
    text: msg.value,
    email: auth.currentUser.email,
    to: currentUserChat,
    time: serverTimestamp()
  });

  msg.value = "";
};
