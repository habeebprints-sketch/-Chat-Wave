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

// ================= WEBRTC CLEAN =================
let pc;
let localStream;
let remoteStream;
let currentCall = null;

const servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

// ================= CLEAN HELPERS =================
function resetCall() {
  if (pc) pc.close();
  pc = null;

  if (localStream) {
    localStream.getTracks().forEach(t => t.stop());
  }

  localStream = null;
  remoteStream = null;
}

// ================= AUTH =================
window.signup = () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .catch(e => alert(e.message));
};

window.login = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .catch(e => alert(e.message));
};

// ================= STATE =================
onAuthStateChanged(auth, (user) => {
  if (user) {
    authBox.style.display = "none";
    loadMessages();
    loadStatus();
    loadChannels();
    listenCalls();
  }
});

// ================= CHAT =================
window.sendMessage = async () => {
  if (!msg.value) return;

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

      div.className = "box " + (data.email === auth.currentUser.email ? "me" : "other");
      div.innerText = data.email + ": " + data.text;

      chat.appendChild(div);
    });
  });
}

// ================= STATUS + CHANNELS (simple) =================
window.postStatus = async () => {
  const text = prompt("Status:");
  await addDoc(collection(db, "status"), {
    text,
    email: auth.currentUser.email,
    time: serverTimestamp()
  });
};

window.createChannel = async () => {
  const name = prompt("Channel:");
  await addDoc(collection(db, "channels"), {
    name,
    owner: auth.currentUser.email,
    time: serverTimestamp()
  });
};

// ================= CALL START =================
window.callUser = async () => {
  const to = prompt("Call email:");
  if (!to) return;

  resetCall();

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localVideo.srcObject = localStream;

  pc = new RTCPeerConnection(servers);
  remoteStream = new MediaStream();
  remoteVideo.srcObject = remoteStream;

  localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

  pc.ontrack = e => {
    e.streams[0].getTracks().forEach(t => remoteStream.addTrack(t));
  };

  pc.onicecandidate = async e => {
    if (e.candidate) {
      await addDoc(collection(db, "calls"), {
        to,
        from: auth.currentUser.email,
        type: "candidate",
        candidate: JSON.stringify(e.candidate)
      });
    }
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  await addDoc(collection(db, "calls"), {
    to,
    from: auth.currentUser.email,
    type: "offer",
    offer: JSON.stringify(offer)
  });
};

// ================= CALL LISTENER =================
function listenCalls() {
  onSnapshot(collection(db, "calls"), snap => {
    snap.forEach(d => {
      const data = d.data();
      const me = auth.currentUser.email;

      if (data.to === me && data.type === "offer") {
        currentCall = data;
        showCallUI(data.from);
      }

      if (data.to === me && data.type === "answer") {
        pc.setRemoteDescription(JSON.parse(data.answer));
      }

      if (data.to === me && data.type === "candidate") {
        pc.addIceCandidate(JSON.parse(data.candidate));
      }
    });
  });
}

// ================= CALL UI =================
function showCallUI(from) {
  callScreen.style.display = "block";
  callText.innerText = "Call from " + from;
}

window.acceptCallUI = async () => {
  callScreen.style.display = "none";

  resetCall();

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localVideo.srcObject = localStream;

  pc = new RTCPeerConnection(servers);
  remoteStream = new MediaStream();
  remoteVideo.srcObject = remoteStream;

  localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

  pc.ontrack = e => {
    e.streams[0].getTracks().forEach(t => remoteStream.addTrack(t));
  };

  const offer = JSON.parse(currentCall.offer);
  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  await addDoc(collection(db, "calls"), {
    to: currentCall.from,
    from: auth.currentUser.email,
    type: "answer",
    answer: JSON.stringify(answer)
  });
};

window.endCall = () => {
  resetCall();
  callScreen.style.display = "none";
};

// ================= NAV =================
window.showChat = () => chat.style.display = "block";
window.showStatus = () => status.style.display = "block";
window.showChannels = () => channels.style.display = "block";
