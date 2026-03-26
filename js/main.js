import { toggleSidebar, toggleDarkMode, updateClock, applySavedTheme } from "./ui.js";
import { login, signup, logout } from "./auth.js";
import { loadProfile, initProfileForm } from "./profile.js";
import { loadAdmin } from "./admin.js";
import { sendMessage } from "./chatbot.js";

function openPopup(type) {
  const popupBg = document.getElementById("popupBg");
  const popupTitle = document.getElementById("popupTitle");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (!popupBg || !popupTitle || !loginForm || !signupForm) return;

  popupBg.style.display = "flex";
  popupTitle.textContent = type === "login" ? "Login" : "Sign Up";
  loginForm.style.display = type === "login" ? "block" : "none";
  signupForm.style.display = type === "signup" ? "block" : "none";
}

function closePopup() {
  const popupBg = document.getElementById("popupBg");
  if (popupBg) {
    popupBg.style.display = "none";
  }
}

function initDropdown() {
  const profileBtn = document.getElementById("profileBtn");
  const dropdown = document.getElementById("dropdown");

  if (!profileBtn || !dropdown) return;

  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  document.addEventListener("click", () => {
    dropdown.classList.remove("show");
  });
}

function initEvents() {
  const menuBtn = document.querySelector(".menu-icon");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const darkToggle = document.querySelector(".toggle-switch");
  const loginBtn = document.querySelector('button[onclick="openPopup(\'login\')"]');
  const signupBtn = document.querySelector('button[onclick="openPopup(\'signup\')"]');
  const closePopupBtn = document.querySelector("#popupBg .popup button:last-of-type");
  const loginSubmit = document.querySelector("#loginForm button");
  const signupSubmit = document.querySelector("#signupForm button");
  const logoutBtn = document.getElementById("logoutBtn");
  const sendBtn = document.querySelector(".input-row button");

  if (menuBtn) menuBtn.addEventListener("click", toggleSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener("click", toggleSidebar);
  if (darkToggle) darkToggle.addEventListener("click", toggleDarkMode);

  if (loginBtn) {
    loginBtn.removeAttribute("onclick");
    loginBtn.addEventListener("click", () => openPopup("login"));
  }

  if (signupBtn) {
    signupBtn.removeAttribute("onclick");
    signupBtn.addEventListener("click", () => openPopup("signup"));
  }

  if (closePopupBtn) {
    closePopupBtn.addEventListener("click", closePopup);
  }

  if (loginSubmit) {
    loginSubmit.addEventListener("click", async () => {
      const success = await login();
      if (success) {
        closePopup();
        loadAdmin();
      }
    });
  }

  if (signupSubmit) {
    signupSubmit.addEventListener("click", async () => {
      const success = await signup();
      if (success) {
        closePopup();
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => logout());
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
  }
}

function initClock() {
  updateClock();
  setInterval(updateClock, 1000);
}

window.addEventListener("DOMContentLoaded", async () => {
  applySavedTheme();
  initEvents();
  initDropdown();
  initProfileForm();
  initClock();

  await loadProfile();
  await loadAdmin();
});