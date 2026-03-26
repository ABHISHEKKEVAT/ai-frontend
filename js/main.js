import { toggleSidebar, toggleDarkMode, updateClock } from "./ui.js";
import { login, signup, logout } from "./auth.js";
import { loadProfile } from "./profile.js";
import { loadAdmin } from "./admin.js";
import { sendMessage } from "./chatbot.js";

/* EVENTS */
menuBtn.onclick = toggleSidebar;
sidebarOverlay.onclick = toggleSidebar;
darkToggle.onclick = toggleDarkMode;

loginBtn.onclick = () => openPopup("login");
signupBtn.onclick = () => openPopup("signup");

loginSubmit.onclick = login;
signupSubmit.onclick = signup;
logoutBtn.onclick = logout;

sendBtn.onclick = sendMessage;

/* INIT */
window.onload = () => {
  loadProfile();
  loadAdmin();
  setInterval(updateClock, 1000);
};

/* POPUP */
function openPopup(type){
  popupBg.style.display = "flex";
  popupTitle.textContent = type;

  loginForm.style.display = type==="login"?"block":"none";
  signupForm.style.display = type==="signup"?"block":"none";
}

closePopup.onclick = () => popupBg.style.display="none";