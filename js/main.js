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
  const dropdown = document.getElementById("dropdown");

  if (!popupBg || !popupTitle || !loginForm || !signupForm) return;

  popupBg.style.display = "flex";
  popupTitle.textContent = type === "login" ? "Login" : "Sign Up";
  loginForm.style.display = type === "login" ? "block" : "none";
  signupForm.style.display = type === "signup" ? "block" : "none";

  if (dropdown) dropdown.classList.remove("show");
}

function closePopup() {
  const popupBg = document.getElementById("popupBg");
  if (popupBg) popupBg.style.display = "none";
}

function initDropdown() {
  const profileBtn = document.getElementById("profileBtn");
  const dropdown = document.getElementById("dropdown");

  if (!profileBtn || !dropdown) return;

  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  dropdown.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", () => dropdown.classList.remove("show"));
}

function initKeyboardAccessibility() {
  const menuBtn = document.getElementById("menuBtn");
  const darkToggle = document.getElementById("darkToggle");
  const userInput = document.getElementById("userInput");

  if (menuBtn) {
    menuBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleSidebar();
      }
    });
  }

  if (darkToggle) {
    darkToggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleDarkMode();
      }
    });
  }

  if (userInput) {
    userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    });
  }
}

function initPopupOutsideClose() {
  const popupBg = document.getElementById("popupBg");
  const popupCard = document.getElementById("popupCard");

  if (!popupBg || !popupCard) return;

  popupBg.addEventListener("click", (e) => {
    if (!popupCard.contains(e.target)) {
      closePopup();
    }
  });

  popupCard.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

function applyAuthState() {
  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const logoutLink = document.getElementById("logoutLink");
  const sidebarLogoutLink = document.getElementById("sidebarLogoutLink");
  const profileBtn = document.getElementById("profileBtn");

  if (loginBtn) loginBtn.style.display = isLoggedIn ? "none" : "";
  if (signupBtn) signupBtn.style.display = isLoggedIn ? "none" : "";
  if (logoutLink) logoutLink.style.display = isLoggedIn ? "" : "none";
  if (sidebarLogoutLink) sidebarLogoutLink.style.display = isLoggedIn ? "" : "none";

  if (!profileBtn) return;
  if (!isLoggedIn) {
    profileBtn.innerHTML = '<span class="profile-icon">My</span> Profile';
    return;
  }

  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const firstName = String(user?.name || "Profile").trim().split(/\s+/)[0];
    profileBtn.innerHTML = `<span class="profile-icon">Hi</span> ${firstName}`;
  } catch {
    profileBtn.innerHTML = '<span class="profile-icon">My</span> Profile';
  }
}

function initEvents() {
  const menuBtn = document.getElementById("menuBtn");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const darkToggle = document.getElementById("darkToggle");
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const closePopupBtn = document.getElementById("closePopupBtn");
  const loginSubmit = document.getElementById("loginSubmitBtn");
  const signupSubmit = document.getElementById("signupSubmitBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutLink = document.getElementById("logoutLink");
  const sidebarLogoutLink = document.getElementById("sidebarLogoutLink");
  const sendBtn = document.getElementById("sendBtn");
  const sidebar = document.getElementById("sidebar");

  if (menuBtn) menuBtn.addEventListener("click", toggleSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener("click", toggleSidebar);
  if (darkToggle) darkToggle.addEventListener("click", toggleDarkMode);

  if (loginBtn) {
    loginBtn.addEventListener("click", () => openPopup("login"));
  }

  if (signupBtn) {
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
        applyAuthState();
        await loadProfile();
        await loadAdmin();
      }
    });
  }

  if (signupSubmit) {
    signupSubmit.addEventListener("click", async () => {
      const success = await signup();
      if (success) closePopup();
    });
  }

  if (logoutBtn) logoutBtn.addEventListener("click", () => logout());

  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      applyAuthState();
      logout();
    });
  }

  if (sidebarLogoutLink) {
    sidebarLogoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      applyAuthState();
      logout();
    });
  }

  if (sendBtn) sendBtn.addEventListener("click", sendMessage);

  if (sidebar) {
    const sidebarLinks = sidebar.querySelectorAll("a");
    sidebarLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (sidebar.classList.contains("open")) {
          toggleSidebar();
        }
      });
    });
  }
}

function initClock() {
  updateClock();
  setInterval(updateClock, 1000);
}

window.addEventListener("DOMContentLoaded", async () => {
  applySavedTheme();
  applyAuthState();
  initEvents();
  initDropdown();
  initKeyboardAccessibility();
  initPopupOutsideClose();
  initProfileForm();
  initClock();

  await loadProfile();
  await loadAdmin();
});
