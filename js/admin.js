import { API } from "./api.js";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export async function loadAdmin() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userList = document.getElementById("userList");
  const adminSection = document.getElementById("admin-section");

  if (!userList || !adminSection) return;

  if (!token || user.role !== "admin") {
    adminSection.style.display = "none";
    userList.innerHTML = "";
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
      .map((u) => `
        <div class="admin-user-item">
          <p><strong>${escapeHtml(u.name || "Unknown User")}</strong></p>
          <p>${escapeHtml(u.email || "")} - ${escapeHtml(u.role || "user")}</p>
          ${u.resetRequestedAt ? `<p>Reset requested: ${escapeHtml(formatDateTime(u.resetRequestedAt))}</p>` : ""}
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
            <input type="password" minlength="6" placeholder="New password" data-reset-password="${escapeHtml(u._id || "")}" />
            <button type="button" class="btn-secondary" data-reset-user="${escapeHtml(u._id || "")}">
              Reset Password
            </button>
          </div>
        </div>
      `)
      .join("");

    userList.querySelectorAll("[data-reset-user]").forEach((button) => {
      button.addEventListener("click", async () => {
        const userId = button.getAttribute("data-reset-user") || "";
        const passwordInput = userList.querySelector(`[data-reset-password="${userId}"]`);
        const password = String(passwordInput?.value || "");

        if (password.length < 6) {
          alert("Password must be at least 6 characters.");
          return;
        }

        try {
          const res = await fetch(`${API}/auth/admin/reset-password`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ userId, password })
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            alert(data.msg || "Password reset failed.");
            return;
          }

          if (passwordInput) passwordInput.value = "";
          alert(data.msg || "Password reset successful.");
          await loadAdmin();
        } catch (resetError) {
          console.error("Admin reset error:", resetError);
          alert("Network error while resetting password.");
        }
      });
    });
  } catch (error) {
    console.error("Admin load error:", error);
    adminSection.style.display = "block";
    userList.innerHTML = "<p>Failed to load users.</p>";
  }
}
