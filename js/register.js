import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const role = document.getElementById('role').value;
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const barCouncil = document.getElementById('barCouncil')?.value || "";
  const specialization = document.getElementById('specialization')?.value || "";
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCred.user.uid), {
      name, email, role,
      ...(role === "advocate" ? { barCouncil, specialization, rating: 4.5 } : {})
    });
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Registration failed: " + err.message);
  }
});
