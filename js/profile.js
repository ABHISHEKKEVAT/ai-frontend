import { API, API_BASE } from "./api.js";

export async function loadProfile() {
  const token = localStorage.getItem("token");

  const profileContent = document.getElementById("profileContent");
  const overviewName = document.getElementById("overviewName");
  const overviewEmail = document.getElementById("overviewEmail");
  const overviewRole = document.getElementById("overviewRole");
  const verifyStatus = document.getElementById("verifyStatus");
  const pfName = document.getElementById("pfName");
  const profilePreview = document.getElementById("profilePreview");

  if (!profileContent && !overviewName && !overviewEmail && !overviewRole) return;

  if (!token) {
    if (profileContent) {
      profileContent.innerHTML = "<p>Please log in to view your profile.</p>";
    }
    if (overviewName) overviewName.textContent = "Guest User";
    if (overviewEmail) overviewEmail.textContent = "";
    if (overviewRole) overviewRole.textContent = "Guest";
    if (verifyStatus) verifyStatus.textContent = "Not logged in";
    if (pfName) pfName.value = "";
    if (profilePreview) profilePreview.src = "https://via.placeholder.com/70";
    return;
  }

  try {
    const res = await fetch(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error("Failed to load profile");
    }

    const user = await res.json();

    if (profileContent) {
      profileContent.innerHTML = `
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>
      `;
    }

    if (overviewName) overviewName.textContent = user.name || "";
    if (overviewEmail) overviewEmail.textContent = user.email || "";
    if (overviewRole) overviewRole.textContent = user.role || "";
    if (verifyStatus) {
      verifyStatus.textContent = user.isVerified ? "Verified" : "Not Verified";
    }
    if (pfName) pfName.value = user.name || "";

    if (profilePreview) {
      profilePreview.src = user.avatar ? `${API_BASE}${user.avatar}` : "https://via.placeholder.com/70";
    }
  } catch (error) {
    console.error("Profile load error:", error);
    if (profileContent) profileContent.innerHTML = "Failed to load profile.";
  }
}

export function initProfileForm() {
  const profileForm = document.getElementById("profileForm");
  const pfAvatar = document.getElementById("pfAvatar");
  const profilePreview = document.getElementById("profilePreview");

  if (pfAvatar && profilePreview) {
    pfAvatar.addEventListener("change", () => {
      const file = pfAvatar.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        profilePreview.src = e.target?.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if (!profileForm) return;

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const pfName = document.getElementById("pfName");
    const pfAvatarInput = document.getElementById("pfAvatar");

    if (!token) {
      alert("Please log in first");
      return;
    }

    if (!pfName) {
      alert("Profile form is not ready");
      return;
    }

    const formData = new FormData();
    formData.append("name", pfName.value.trim());

    if (pfAvatarInput?.files?.[0]) {
      formData.append("avatar", pfAvatarInput.files[0]);
    }

    try {
      const res = await fetch(`${API}/users/me`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) {
        throw new Error("Update failed");
      }

      alert("Profile updated");
      await loadProfile();
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Profile update failed");
    }
  });
}

