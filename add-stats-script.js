
import { getWearableData } from './wearable.js';

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, doc, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDyBaQL4wHmFrllbQ1FyUDfGWf5H79u-2g",
  authDomain: "health-46f91.firebaseapp.com",
  projectId: "health-46f91",
  storageBucket: "health-46f91.appspot.com",
  messagingSenderId: "238309237516",
  appId: "1:238309237516:web:b58d6e76d1443960ac9f29"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById("statsForm");
const successMsg = document.getElementById("successMsg");
const syncBtn = document.getElementById("syncBtn");

onAuthStateChanged(auth, (user) => {
  if (!user) return (window.location.href = "auth.html");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const date = document.getElementById("date").value;
    const bp = document.getElementById("bp").value;
    const heartRate = document.getElementById("heartRate").value;
    const sugar = document.getElementById("sugar").value;

    try {
      await addDoc(collection(doc(db, "users", user.uid), "healthStats"), {
        bp,
        heartRate: Number(heartRate),
        sugar: Number(sugar),
        date
      });
      showSuccess();
      form.reset();
    } catch (err) {
      alert("Error: " + err.message);
    }
  });

  syncBtn.addEventListener("click", async () => {
    const wearableData = getWearableData();

    try {
      await addDoc(collection(doc(db, "users", user.uid), "healthStats"), wearableData);
      showSuccess();
    } catch (err) {
      alert("Wearable Sync Error: " + err.message);
    }
  });
});

function showSuccess() {
  successMsg.classList.remove("hidden");
  successMsg.classList.add("animate-fade-in");
  setTimeout(() => successMsg.classList.add("hidden"), 3000);
}
