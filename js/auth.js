import { API } from "./api.js";

export async function login() {
  const email = liEmail.value;
  const password = liPassword.value;

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if(res.ok){
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    alert("Login success");
  } else {
    alert("Login failed");
  }
}

export async function signup() {
  const res = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      name: suName.value,
      email: suEmail.value,
      password: suPassword.value
    })
  });

  alert("Signup done");
}

export function logout() {
  localStorage.clear();
}