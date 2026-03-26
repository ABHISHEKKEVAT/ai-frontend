export function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebarOverlay").classList.toggle("show");
}

export function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

export function updateClock() {
  document.getElementById("clock").textContent =
    new Date().toLocaleString();
}