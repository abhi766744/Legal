import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDoc, doc, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const welcome = document.getElementById('welcome');
const clientPanel = document.getElementById('clientPanel');
const advocatePanel = document.getElementById('advocatePanel');
const logoutBtn = document.getElementById('logoutBtn');

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    alert("User data not found!");
    await signOut(auth);
    window.location.href = "login.html";
    return;
  }
  const data = userDoc.data();
  welcome.textContent = `Welcome, ${data.name}!`;
  if (data.role === "client") {
    clientPanel.style.display = "block";
    loadAdvocates();
    loadConsults(user.uid);
    document.getElementById('consultForm').onsubmit = async function(e) {
      e.preventDefault();
      const advocateId = document.getElementById('advocateSelect').value;
      const issue = document.getElementById('issue').value.trim();
      if (!advocateId || !issue) return alert("Please fill all fields");
      await addDoc(collection(db, "consultations"), {
        clientId: user.uid,
        clientName: data.name,
        advocateId,
        issue,
        status: "pending",
        created: Date.now()
      });
      alert("Consultation booked!");
      loadConsults(user.uid);
      this.reset();
    };
  } else if (data.role === "advocate") {
    advocatePanel.style.display = "block";
    loadBookings(user.uid, data.name);
  }
});

logoutBtn.onclick = async () => {
  await signOut(auth);
  window.location.href = "login.html";
};

async function loadAdvocates() {
  const sel = document.getElementById('advocateSelect');
  sel.innerHTML = "<option value=''>Select Advocate</option>";
  const q = query(collection(db, "users"), where("role", "==", "advocate"));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    const d = doc.data();
    sel.innerHTML += `<option value="${doc.id}">${d.name} (${d.specialization || "General"})</option>`;
  });
}

async function loadConsults(uid) {
  const list = document.getElementById('consultList');
  list.innerHTML = "";
  const q = query(collection(db, "consultations"), where("clientId", "==", uid));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    const d = doc.data();
    list.innerHTML += `<li class="border rounded p-2">${d.issue} <span class="text-xs text-gray-600">(${d.status})</span></li>`;
  });
}

async function loadBookings(advocateId, advocateName) {
  const list = document.getElementById('bookingList');
  list.innerHTML = "";
  const q = query(collection(db, "consultations"), where("advocateId", "==", advocateId));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    const d = doc.data();
    list.innerHTML += `<li class="border rounded p-2">${d.clientName}: ${d.issue} <span class="text-xs text-gray-600">(${d.status})</span></li>`;
  });
}
