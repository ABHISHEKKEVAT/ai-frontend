import { API } from "./api.js";

export async function loadProfile() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Login first");
    window.location.href = "index.html";
    return;
  }

  const res = await fetch(`${API}/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const user = await res.json();

  // LEFT CARD
  document.getElementById("overviewName").textContent = user.name;
  document.getElementById("overviewEmail").textContent = user.email;
  document.getElementById("overviewRole").textContent = user.role;

  document.getElementById("verifyStatus").textContent =
    user.isVerified ? "Verified ✅" : "Not Verified ❌";

  // RIGHT CARD
  document.getElementById("profileContent").innerHTML = `
    <p><strong>Name:</strong> ${user.name}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Role:</strong> ${user.role}</p>
  `;

  document.getElementById("pfName").value = user.name;

  if (user.avatar) {
    document.getElementById("profilePreview").src =
      "https://ai-backend-1-7kxh.onrender.com" + user.avatar;
  }
}

/* UPDATE PROFILE */
document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const name = document.getElementById("pfName").value;
  const avatar = document.getElementById("pfAvatar").files[0];

  const formData = new FormData();
  formData.append("name", name);
  if (avatar) formData.append("avatar", avatar);

  const res = await fetch(`${API}/users/me`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  if (res.ok) {
    alert("Profile updated");
    loadProfile();
  } else {
    alert("Update failed");
  }
});