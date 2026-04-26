import { API, API_BASE } from "./api.js";

const FALLBACK_AVATAR = "https://via.placeholder.com/160";
const PROFILE_FIELD_IDS = [
  "pfName",
  "pfPhone",
  "pfJobTitle",
  "pfDepartment",
  "pfLocation",
  "pfEmployeeId",
  "pfManagerName",
  "pfJoinDate",
  "pfBio",
  "pfSkills",
  "pfLinkedinUrl"
];

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeText(value) {
  return String(value || "").trim();
}

function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function normalizeHttpUrl(value) {
  const raw = normalizeText(value);
  if (!raw) return "";

  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return "";
  } catch {
    return "";
  }
}

function formatDateForInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function formatDateForDisplay(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value;
}

function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = value;
}

function resetProfileUI() {
  setText("overviewName", "Guest User");
  setText("overviewEmail", "");
  setText("overviewRole", "Guest");
  setText("verifyStatus", "Not logged in");
  setText("metricCompletion", "0%");
  setText("metricDepartment", "Not set");
  setText("metricEmployeeId", "Not set");
  setText("infoJobTitle", "Not set");
  setText("infoPhone", "Not set");
  setText("infoLocation", "Not set");
  setText("infoManagerName", "Not set");
  setText("infoJoinDate", "Not set");

  const profileContent = document.getElementById("profileContent");
  if (profileContent) {
    profileContent.innerHTML = "<p>Please log in to view your profile.</p>";
  }

  const preview = document.getElementById("profilePreview");
  if (preview) preview.src = FALLBACK_AVATAR;

  for (const fieldId of PROFILE_FIELD_IDS) {
    setInputValue(fieldId, "");
  }
}

function updateUserCache(user) {
  try {
    const existing = JSON.parse(localStorage.getItem("user") || "{}");
    const next = {
      ...existing,
      id: user.id || existing.id,
      name: user.name || "",
      email: user.email || "",
      role: user.role || existing.role || "user",
      avatar: user.avatar || "",
      isVerified: Boolean(user.isVerified),
      department: user.department || "",
      jobTitle: user.jobTitle || ""
    };
    localStorage.setItem("user", JSON.stringify(next));
  } catch (error) {
    console.error("Failed to update user cache:", error);
  }
}

function renderProfileContent(user) {
  const profileContent = document.getElementById("profileContent");
  if (!profileContent) return;

  const linkedinUrl = normalizeHttpUrl(user.linkedinUrl);
  const linkedin = linkedinUrl
    ? `<a href="${escapeHtml(linkedinUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(linkedinUrl)}</a>`
    : "Not set";

  profileContent.innerHTML = `
    <p><strong>Name:</strong> ${escapeHtml(user.name || "")}</p>
    <p><strong>Email:</strong> ${escapeHtml(user.email || "")}</p>
    <p><strong>Role:</strong> ${escapeHtml(user.role || "")}</p>
    <p><strong>Job Title:</strong> ${escapeHtml(user.jobTitle || "Not set")}</p>
    <p><strong>Department:</strong> ${escapeHtml(user.department || "Not set")}</p>
    <p><strong>Location:</strong> ${escapeHtml(user.location || "Not set")}</p>
    <p><strong>Employee ID:</strong> ${escapeHtml(user.employeeId || "Not set")}</p>
    <p><strong>LinkedIn:</strong> ${linkedin}</p>
  `;
}

function renderProfileMetrics(user) {
  const completionFields = [
    user.name,
    user.phone,
    user.jobTitle,
    user.department,
    user.location,
    user.employeeId,
    user.managerName,
    user.joinDate,
    user.bio,
    user.skills,
    user.linkedinUrl,
    user.avatar
  ];
  const completed = completionFields.filter((v) => normalizeText(v)).length;
  const completion = Math.round((completed / completionFields.length) * 100);

  setText("metricCompletion", `${completion}%`);
  setText("metricDepartment", user.department || "Not set");
  setText("metricEmployeeId", user.employeeId || "Not set");
}

function renderProfileSummary(user) {
  setText("overviewName", user.name || "Guest User");
  setText("overviewEmail", user.email || "");
  setText("overviewRole", user.role || "User");
  setText("verifyStatus", user.isVerified ? "Verified" : "Not Verified");
  setText("infoJobTitle", user.jobTitle || "Not set");
  setText("infoPhone", user.phone || "Not set");
  setText("infoLocation", user.location || "Not set");
  setText("infoManagerName", user.managerName || "Not set");
  setText("infoJoinDate", formatDateForDisplay(user.joinDate));

  const preview = document.getElementById("profilePreview");
  if (preview) {
    preview.src = user.avatar ? `${API_BASE}${user.avatar}` : FALLBACK_AVATAR;
  }
}

function fillProfileForm(user) {
  setInputValue("pfName", user.name || "");
  setInputValue("pfPhone", user.phone || "");
  setInputValue("pfJobTitle", user.jobTitle || "");
  setInputValue("pfDepartment", user.department || "");
  setInputValue("pfLocation", user.location || "");
  setInputValue("pfEmployeeId", user.employeeId || "");
  setInputValue("pfManagerName", user.managerName || "");
  setInputValue("pfJoinDate", formatDateForInput(user.joinDate));
  setInputValue("pfBio", user.bio || "");
  setInputValue("pfSkills", user.skills || "");
  setInputValue("pfLinkedinUrl", user.linkedinUrl || "");
}

export async function loadProfile() {
  const token = localStorage.getItem("token");
  if (!token) {
    resetProfileUI();
    return;
  }

  try {
    const res = await fetch(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 401) {
      clearAuthSession();
      resetProfileUI();
      return;
    }

    if (!res.ok) {
      throw new Error("Failed to load profile");
    }

    const user = await res.json();
    renderProfileContent(user);
    renderProfileSummary(user);
    renderProfileMetrics(user);
    fillProfileForm(user);
    updateUserCache(user);
  } catch (error) {
    console.error("Profile load error:", error);
    const profileContent = document.getElementById("profileContent");
    if (profileContent) profileContent.innerHTML = "<p>Failed to load profile.</p>";
  }
}

export function initProfileForm() {
  const profileForm = document.getElementById("profileForm");
  const pfAvatar = document.getElementById("pfAvatar");
  const profilePreview = document.getElementById("profilePreview");
  const openEditProfileBtn = document.getElementById("openEditProfileBtn");
  const closeEditProfileBtn = document.getElementById("closeEditProfileBtn");
  const editProfileDropdown = document.getElementById("editProfileDropdown");
  const editProfilePanel = document.getElementById("editProfilePanel");

  const closeEditProfilePanel = () => {
    if (!editProfileDropdown) return;
    editProfileDropdown.classList.remove("show");
  };

  const openEditProfilePanel = () => {
    if (!editProfileDropdown) return;
    if (!localStorage.getItem("token")) {
      alert("Please log in first");
      return;
    }
    editProfileDropdown.classList.add("show");
  };

  if (openEditProfileBtn) {
    openEditProfileBtn.addEventListener("click", openEditProfilePanel);
  }

  if (closeEditProfileBtn) {
    closeEditProfileBtn.addEventListener("click", closeEditProfilePanel);
  }

  if (editProfileDropdown) {
    editProfileDropdown.addEventListener("click", (e) => {
      if (editProfilePanel && editProfilePanel.contains(e.target)) return;
      closeEditProfilePanel();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeEditProfilePanel();
  });

  if (pfAvatar && profilePreview) {
    pfAvatar.addEventListener("change", () => {
      const file = pfAvatar.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        profilePreview.src = e.target?.result || FALLBACK_AVATAR;
      };
      reader.readAsDataURL(file);
    });
  }

  if (!profileForm) return;

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first");
      return;
    }

    const pfName = document.getElementById("pfName");
    const pfPhone = document.getElementById("pfPhone");
    const pfJobTitle = document.getElementById("pfJobTitle");
    const pfDepartment = document.getElementById("pfDepartment");
    const pfLocation = document.getElementById("pfLocation");
    const pfEmployeeId = document.getElementById("pfEmployeeId");
    const pfManagerName = document.getElementById("pfManagerName");
    const pfJoinDate = document.getElementById("pfJoinDate");
    const pfBio = document.getElementById("pfBio");
    const pfSkills = document.getElementById("pfSkills");
    const pfLinkedinUrl = document.getElementById("pfLinkedinUrl");
    const pfAvatarInput = document.getElementById("pfAvatar");

    if (!pfName) {
      alert("Profile form is not ready");
      return;
    }

    const name = normalizeText(pfName.value);
    if (!name) {
      alert("Name is required");
      pfName.focus();
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", normalizeText(pfPhone?.value));
    formData.append("jobTitle", normalizeText(pfJobTitle?.value));
    formData.append("department", normalizeText(pfDepartment?.value));
    formData.append("location", normalizeText(pfLocation?.value));
    formData.append("employeeId", normalizeText(pfEmployeeId?.value));
    formData.append("managerName", normalizeText(pfManagerName?.value));
    formData.append("joinDate", normalizeText(pfJoinDate?.value));
    formData.append("bio", normalizeText(pfBio?.value));
    formData.append("skills", normalizeText(pfSkills?.value));
    formData.append("linkedinUrl", normalizeText(pfLinkedinUrl?.value));

    if (pfAvatarInput?.files?.[0]) {
      formData.append("avatar", pfAvatarInput.files[0]);
    }

    try {
      const res = await fetch(`${API}/users/me`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        clearAuthSession();
        closeEditProfilePanel();
        alert("Session expired. Please login again.");
        window.location.href = "profile.html";
        return;
      }

      if (!res.ok) {
        throw new Error(data.msg || "Profile update failed");
      }

      updateUserCache(data);
      alert("Profile updated successfully");
      closeEditProfilePanel();
      await loadProfile();
    } catch (error) {
      console.error("Profile update error:", error);
      alert(error.message || "Profile update failed");
    }
  });
}
