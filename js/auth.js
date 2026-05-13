import { API } from "./api.js";
let isSignupSubmitting = false;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email || "").trim());
}

function validatePasswordPolicy(password) {
  const value = String(password || "");

  if (value.length < 8 || value.length > 64) {
    return "Password must be 8-64 characters and include uppercase, lowercase, number, and special character.";
  }
  if (/\s/.test(value)) {
    return "Password cannot contain spaces.";
  }
  if (!/[a-z]/.test(value)) {
    return "Password must include at least one lowercase letter.";
  }
  if (!/[A-Z]/.test(value)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/[0-9]/.test(value)) {
    return "Password must include at least one number.";
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    return "Password must include at least one special character.";
  }

  return "";
}

export async function login() {
  const emailInput = document.getElementById("liEmail");
  const passwordInput = document.getElementById("liPassword");

  if (!emailInput || !passwordInput) {
    alert("Login form not found");
    return false;
  }

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Please enter email and password");
    return false;
  }
  if (!isValidEmail(email)) {
    alert("Please enter a valid email address (example: name@gmail.com).");
    return false;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Login failed");
      return false;
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    alert("Login successful");
    return true;
  } catch (error) {
    console.error("Login error:", error);
    alert("Login error");
    return false;
  }
}

export async function signup() {
  if (isSignupSubmitting) return false;

  const nameInput = document.getElementById("suName");
  const emailInput = document.getElementById("suEmail");
  const passwordInput = document.getElementById("suPassword");
  const confirmPasswordInput = document.getElementById("suConfirmPassword");
  const roleInput = document.getElementById("suRole");
  const adminCodeInput = document.getElementById("suAdminCode");
  const submitBtn = document.getElementById("signupSubmitBtn");

  if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
    alert("Signup form not found");
    return false;
  }

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const role = roleInput?.value === "admin" ? "admin" : "user";
  const adminCode = String(adminCodeInput?.value || "").trim();

  if (!name || !email || !password || !confirmPassword) {
    alert("Please fill all signup fields");
    return false;
  }
  if (password !== confirmPassword) {
    alert("Password and confirm password must match.");
    return false;
  }
  if (!isValidEmail(email)) {
    alert("Please enter a valid email address (example: name@yahoo.com).");
    return false;
  }
  const passwordPolicyError = validatePasswordPolicy(password);
  if (passwordPolicyError) {
    alert(passwordPolicyError);
    return false;
  }
  if (role === "admin" && !adminCode) {
    alert("Admin verification code is required for admin account signup.");
    return false;
  }

  try {
    isSignupSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Signing Up...";
    }

    const res = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, adminCode })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Signup failed");
      return false;
    }

    alert(data.msg || "Signup successful");
    return true;
  } catch (error) {
    console.error("Signup error:", error);
    alert("Signup error");
    return false;
  } finally {
    isSignupSubmitting = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign Up";
    }
  }
}

export function logout(redirect = true) {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  if (redirect) {
    window.location.href = "index.html";
  }
}
