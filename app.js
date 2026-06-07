import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
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


// 🔥 YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDxvSOTQBsy3Kl-pP34MxUDdGWsmUeiMyw",
  authDomain: "chat-wave-711fc.firebaseapp.com",
  projectId: "chat-wave-711fc",
  storageBucket: "chat-wave-711fc.firebasestorage.app",
  messagingSenderId: "556719208115",
  appId: "1:556719208115:web:47cb316cde725c134422c6"
};


// INIT FIREBASE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// ========================
// 🔐 AUTH FUNCTIONS
// ========================

window.signup = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Account created!");
    })
    .catch(err => alert(err.message));
};


window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Login successful!");
    })
    .catch(err => alert(err.message));
};


// ========================
// 💬 SEND MESSAGE
// ========================

window.sendMessage = async function () {
  const msg = document.getElementById("msg").value;

  if (msg === "") return;

  await addDoc(collection(db, "messages"), {
    text: msg,
    time: serverTimestamp()
  });

  document.getElementById("msg").value = "";
};


// ========================
// 📡 REALTIME CHAT
// ========================

const q = query(collection(db, "messages"), orderBy("time"));

onSnapshot(q, (snapshot) => {
  const chatDiv = document.getElementById("chat");
  chatDiv.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();

    const p = document.createElement("p");
    p.innerText = data.text;

    chatDiv.appendChild(p);
  });
});
