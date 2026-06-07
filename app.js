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

// ================= WEBRTC =================
let localStream;
let peerConnection;

const servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

// ================= AUTH =================
window.signup = () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(() => alert("Signup OK"))
    .catch(e => alert(e.message));
};

window.login = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => alert("Login OK"))
    .catch(e => alert(e.message));
};

// ================= APP STATE =================
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
  const text = prompt("Status:");

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

// ================= CALL SYSTEM =================
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

// ================= INCOMING CALLS =================
function listenForCalls() {
  onSnapshot(collection(db, "calls"), (snapshot) => {
    snapshot.forEach(docSnap => {
      const data = docSnap.data();

      if (data.to === auth.currentUser.email && data.status === "calling") {
        showIncomingCall(data.from);
      }
    });
  });
}

// ================= INCOMING CALL UI =================
window.showIncomingCall = function (caller) {
  const accept = confirm("📞 Call from " + caller + "\nOK = Accept / Cancel = Reject");

  if (accept) {
    acceptCall(caller);
  } else {
    alert("Call rejected");
  }
};

// ================= ACCEPT CALL (WEBRTC START) =================
window.acceptCall = async function (caller) {
  alert("Connecting with " + caller);

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localVideo.srcObject = localStream;

  peerConnection = new RTCPeerConnection(servers);

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };

  alert("Camera + mic ready (next step = full connection sync)");
};

// ================= NAV =================
window.showChat = () => chat.style.display = "block";
window.showStatus = () => status.style.display = "block";
window.showChannels = () => channels.style.display = "block";
