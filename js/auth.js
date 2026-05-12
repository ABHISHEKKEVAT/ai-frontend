import { API } from "./api.js";
let isSignupSubmitting = false;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email || "").trim());
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
  const roleInput = document.getElementById("suRole");
  const submitBtn = document.getElementById("signupSubmitBtn");

  if (!nameInput || !emailInput || !passwordInput) {
    alert("Signup form not found");
    return false;
  }

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const role = roleInput?.value === "admin" ? "admin" : "user";

  if (!name || !email || !password) {
    alert("Please fill all signup fields");
    return false;
  }
  if (!isValidEmail(email)) {
    alert("Please enter a valid email address (example: name@yahoo.com).");
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
      body: JSON.stringify({ name, email, password, role })
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
