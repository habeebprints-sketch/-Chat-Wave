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

// ================= FIREBASE =================
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

// ================= AUTH =================

window.signup = () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(() => alert("Signup successful"))
    .catch(e => alert(e.message));
};

window.login = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => alert("Login successful"))
    .catch(e => alert(e.message));
};

// ================= AUTH STATE =================

onAuthStateChanged(auth, (user) => {
  if (user) {
    authBox.style.display = "none";

    loadMessages();
    loadStatus();
    loadChannels();
    listenForCalls();
  }
});

// ================= CHAT =================

window.sendMessage = async () => {
  if (!auth.currentUser) return;

  await addDoc(collection(db, "messages"), {
    text: msg.value,
    email: auth.currentUser.email,
    time: serverTimestamp()
  });

  msg.value = "";
};

function loadMessages() {
  const q = query(collection(db, "messages"), orderBy("time"));

  onSnapshot(q, snap => {
    chat.innerHTML = "";

    snap.forEach(d => {
      const data = d.data();

      const div = document.createElement("div");
      div.className = "box";
      div.innerHTML = `<b>${data.email}</b><br>${data.text}`;

      chat.appendChild(div);
    });
  });
}

// ================= STATUS =================

window.postStatus = async () => {
  const text = prompt("Enter status:");

  await addDoc(collection(db, "status"), {
    text,
    email: auth.currentUser.email,
    time: serverTimestamp()
  });
};

function loadStatus() {
  const q = query(collection(db, "status"), orderBy("time", "desc"));

  onSnapshot(q, snap => {
    status.innerHTML = "";

    snap.forEach(d => {
      const data = d.data();

      const div = document.createElement("div");
      div.className = "box";
      div.innerHTML = `${data.email}: ${data.text}`;

      status.appendChild(div);
    });
  });
}

// ================= CHANNELS =================

window.createChannel = async () => {
  const name = prompt("Channel name:");

  await addDoc(collection(db, "channels"), {
    name,
    owner: auth.currentUser.email,
    time: serverTimestamp()
  });
};

function loadChannels() {
  const q = query(collection(db, "channels"), orderBy("time", "desc"));

  onSnapshot(q, snap => {
    channels.innerHTML = "";

    snap.forEach(d => {
      const data = d.data();

      const div = document.createElement("div");
      div.className = "box";
      div.innerHTML = `📢 ${data.name}`;

      channels.appendChild(div);
    });
  });
}

// ================= CALL SYSTEM (STEP 1 + 2) =================

// 📞 START CALL
window.callUser = async () => {
  const target = prompt("Enter email to call:");

  if (!target) return;

  await addDoc(collection(db, "calls"), {
    from: auth.currentUser.email,
    to: target,
    status: "calling",
    time: serverTimestamp()
  });

  alert("📞 Calling " + target);
};

// 📡 LISTEN FOR INCOMING CALLS
function listenForCalls() {
  onSnapshot(collection(db, "calls"), (snapshot) => {
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const me = auth.currentUser?.email;

      if (data.to === me && data.status === "calling") {
        showIncomingCall(data.from);
      }
    });
  });
}

// 📲 INCOMING CALL POPUP
window.showIncomingCall = function (callerEmail) {
  const accept = confirm(
    "📞 Incoming call from: " + callerEmail +
    "\n\nPress OK to ACCEPT or Cancel to REJECT"
  );

  if (accept) {
    acceptCall(callerEmail);
  } else {
    alert("❌ Call rejected");
  }
};

// 📞 ACCEPT CALL (BASIC FOR NOW)
window.acceptCall = function (callerEmail) {
  alert("📞 Connecting call with " + callerEmail);

  // WebRTC video/audio will be added in next step
};

// ================= NAV =================

window.showChat = () => chat.style.display = "block";
window.showStatus = () => status.style.display = "block";
window.showChannels = () => channels.style.display = "block";
