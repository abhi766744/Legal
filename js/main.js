// Redirect logged-in users to dashboard
import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
onAuthStateChanged(auth, user => {
  if (user) window.location.href = "dashboard.html";
});
