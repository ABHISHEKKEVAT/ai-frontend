import { API } from "./api.js";

export async function loadProfile() {
  const token = localStorage.getItem("token");

  if (!token) return;

  const res = await fetch(`${API}/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const user = await res.json();

  document.getElementById("profileContent").innerHTML =
    `${user.name} (${user.email})`;
}