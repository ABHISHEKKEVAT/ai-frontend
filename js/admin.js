import { API } from "./api.js";

export async function loadAdmin() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userList = document.getElementById("userList");
  const adminSection = document.getElementById("admin-section");

  if (!userList || !adminSection) return;
  if (!token || user.role !== "admin") {
    adminSection.style.display = "none";
    return;
  }

  try {
    const res = await fetch(`${API}/users/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error("Failed to load admin data");
    }

    const users = await res.json();

    adminSection.style.display = "block";
    userList.innerHTML = users
      .map(
        (u) => `
          <p>${u.name} - ${u.email} - ${u.role}</p>
        `
      )
      .join("");
  } catch (error) {
    console.error("Admin load error:", error);
    userList.innerHTML = "<p>Failed to load users.</p>";
  }
}