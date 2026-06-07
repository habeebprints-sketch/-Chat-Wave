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


// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDxvSOTQBsy3Kl-pP34MxUDdGWsmUeiMyw",
  authDomain: "chat-wave-711fc.firebaseapp.com",
  projectId: "chat-wave-711fc",
  storageBucket: "chat-wave-711fc.firebasestorage.app",
  messagingSenderId: "556719208115",
  appId: "1:556719208115:web:47cb316cde725c134422c6"
};


// INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// =========================
// 🔐 AUTH
// =========================

window.signup = function () {
  const email = emailBox().value;
  const pass = passBox().value;

  createUserWithEmailAndPassword(auth, email, pass)
    .then(() => alert("Signup successful"))
    .catch(e => alert(e.message));
};

window.login = function () {
  const email = emailBox().value;
  const pass = passBox().value;

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => alert("Login successful"))
    .catch(e => alert(e.message));
};


// =========================
// 👤 AUTH STATE
// =========================

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("chat").style.display = "flex";
    document.getElementById("msgBox").style.display = "block";
    document.getElementById("authBox").style.display = "none";

    loadMessages(user);
  } else {
    document.getElementById("chat").style.display = "none";
    document.getElementById("msgBox").style.display = "none";
    document.getElementById("authBox").style.display = "block";
  }
});


// =========================
// 💬 SEND MESSAGE
// =========================

window.sendMessage = async function () {
  const msg = document.getElementById("msg").value;
  const user = auth.currentUser;

  if (!msg || !user) return;

  await addDoc(collection(db, "messages"), {
    text: msg,
    email: user.email,
    time: serverTimestamp()
  });

  document.getElementById("msg").value = "";
};


// =========================
// 📡 LOAD MESSAGES
// =========================

function loadMessages(user) {
  const q = query(collection(db, "messages"), orderBy("time"));

  onSnapshot(q, (snapshot) => {
    const chat = document.getElementById("chat");
    chat.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();

      const div = document.createElement("div");
      div.classList.add("msg");

      if (data.email === user.email) {
        div.classList.add("me");
      } else {
        div.classList.add("other");
      }

      div.innerHTML = `
        <b>${data.email}</b><br>
        ${data.text}
      `;

      chat.appendChild(div);
    });

    chat.scrollTop = chat.scrollHeight;
  });
}


// helpers
function emailBox() {
  return document.getElementById("email");
}

function passBox() {
  return document.getElementById("password");
}
