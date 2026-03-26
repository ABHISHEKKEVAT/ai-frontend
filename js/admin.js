import { API } from "./api.js";

export async function loadAdmin() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if(user.role !== "admin") return;

  const res = await fetch(`${API}/users/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const users = await res.json();

  userList.innerHTML = users.map(u =>
    `<p>${u.name} - ${u.role}</p>`
  ).join("");
}