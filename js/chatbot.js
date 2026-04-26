import { API } from "./api.js";

const COMMON_SUGGESTIONS = [
  "How do I apply for leave?",
  "Where can I download my payslip?",
  "How do I reset my password?",
  "Where are company policies?"
];

const ROLE_SUGGESTIONS = {
  admin: [
    "How do I manage users and roles?",
    "How do I review pending approvals?"
  ],
  user: [
    "How do I raise an IT support ticket?",
    "How do I submit reimbursement?"
  ],
  guest: [
    "How do I sign up and verify my email?",
    "How do I contact HR support?"
  ]
};

function getCurrentUserRole() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.role || "guest";
  } catch {
    return "guest";
  }
}

const FALLBACK_INTENTS = [
  {
    keywords: ["hello", "hi", "hey", "good morning", "good evening"],
    reply:
      "Hello! I am your Employee Assistant.\nI can help with leave, payroll, onboarding, IT support, policies, and profile updates."
  },
  {
    keywords: [
      "leave",
      "vacation",
      "holiday",
      "time off",
      "sick leave",
      "casual leave",
      "paid leave",
      "leave balance"
    ],
    reply:
      "To request leave:\n1) Open HR -> Leave Requests\n2) Select leave type and dates\n3) Submit for manager approval"
  },
  {
    keywords: ["benefit", "benefits", "insurance", "salary", "payroll", "payslip", "ctc", "compensation"],
    reply:
      "For payroll and benefits:\n1) Open HR -> Payroll/Benefits\n2) Check payslips and insurance details\n3) Contact HR if any deduction looks incorrect"
  },
  {
    keywords: ["onboarding", "training", "joining", "new hire", "orientation", "welcome kit", "induction"],
    reply:
      "Onboarding checklist:\n1) Complete profile and documents\n2) Finish mandatory trainings\n3) Meet your manager/team and review role goals"
  },
  {
    keywords: ["attendance", "timesheet", "check in", "check out", "work hours", "late mark"],
    reply:
      "You can manage attendance in Attendance/Timesheet.\nIf entries are missing, add or correct them before payroll cutoff."
  },
  {
    keywords: ["remote work", "wfh", "work from home", "hybrid", "office days"],
    reply:
      "For WFH/hybrid:\n1) Submit request in HR portal\n2) Select dates/reason\n3) Wait for manager approval"
  },
  {
    keywords: ["reimbursement", "expense", "travel claim", "bill", "invoice", "claim"],
    reply:
      "For reimbursement:\n1) Open Finance -> Expenses\n2) Add claim with receipt/invoice\n3) Submit for finance approval"
  },
  {
    keywords: ["it support", "laptop", "email issue", "vpn", "software access", "access request"],
    reply:
      "For IT support, raise a Helpdesk ticket with:\n- issue summary\n- priority\n- screenshot/error message\nThis helps faster resolution."
  },
  {
    keywords: ["policy", "code of conduct", "hr policy", "notice period", "probation"],
    reply:
      "Company policies are in the HR Knowledge Base.\nYou can check sections like Code of Conduct, Probation, Notice Period, and Separation."
  },
  {
    keywords: ["holiday calendar", "public holiday", "company holiday", "festival holiday"],
    reply:
      "Holiday calendar is available in HR -> Holidays.\nYou can also sync/export it to your personal calendar."
  },
  {
    keywords: ["manager", "approval", "approver", "reporting manager", "escalation"],
    reply:
      "For approvals:\n1) Open Requests -> Pending Approvals\n2) Check current approver/manager\n3) Escalate to HR/Admin if delayed"
  },
  {
    keywords: ["performance", "review", "goal", "kpi", "appraisal", "promotion"],
    reply:
      "Performance and appraisal are under the Performance section.\nYou can review goals, KPI progress, and cycle timelines there."
  },
  {
    keywords: ["profile", "account", "update profile", "avatar"],
    reply:
      "Go to Profile page to update your name, avatar, and account details."
  },
  {
    keywords: ["admin", "users", "user list", "roles", "permissions", "manage users"],
    reply:
      "Admin users can open the Admin section to review users, roles, and access permissions."
  },
  {
    keywords: ["reset password", "forgot password", "password", "change password", "login issue", "cannot login"],
    reply:
      "If you cannot log in:\n1) Open Request Password Reset\n2) Admin verifies your account and resets password\n3) Log in again using the new password from admin"
  },
  {
    keywords: ["document", "offer letter", "experience letter", "salary certificate", "id card"],
    reply:
      "Request documents from HR -> Documents.\nCommon requests: Offer Letter, Experience Letter, Salary Certificate, ID Card."
  },
  {
    keywords: ["abhishek"],
    reply: "Hello sir, how may I help you?"
  },
  {
    keywords: ["rimal"],
    reply: "Hello Rimal, do you want to join my company?"
  },
  {
    keywords: ["pratik"],
    reply: "Hello Pratik, how may I help you?"
  }
];

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreIntent(query, intent) {
  let score = 0;

  for (const keyword of intent.keywords) {
    const k = normalizeText(keyword);
    if (!k) continue;

    if (query.includes(k)) {
      score += Math.min(3, k.split(" ").length);
    }
  }

  return score;
}

function getRoleAwareReply(baseReply, role, query) {
  const isAdminQuery = ["admin", "users", "permissions", "roles"].some((k) => query.includes(k));

  if (isAdminQuery && role !== "admin") {
    return `${baseReply}\nNote: Admin features are visible only for admin accounts.`;
  }

  if (role === "admin" && isAdminQuery) {
    return `${baseReply}\nAdmin tip: You can review users from Admin -> User List and verify role-based access.`;
  }

  return baseReply;
}

export function getAIResponse(text, role = getCurrentUserRole()) {
  const q = normalizeText(text);

  if (!q) {
    return "Please type a question so I can help.";
  }

  if (["help", "start", "menu", "options", "new", "first day"].some((k) => q.includes(k))) {
    const rolePrompt =
      role === "admin"
        ? "\n- How do I manage users and roles?"
        : "\n- How can I contact admin support?";

    return `Welcome! You can ask me things like:\n- ${COMMON_SUGGESTIONS.join("\n- ")}${rolePrompt}`;
  }

  let bestIntent = null;
  let bestScore = 0;

  for (const intent of FALLBACK_INTENTS) {
    const score = scoreIntent(q, intent);
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  if (bestIntent && bestScore > 0) {
    return getRoleAwareReply(bestIntent.reply, role, q);
  }

  const roleLine =
    role === "admin"
      ? "\nTry: How do I manage users and roles?"
      : role === "user"
        ? "\nTry: How do I raise an IT support ticket?"
        : "\nTry: How do I sign up and verify my email?";

  return `I can help with leave, payroll, onboarding, attendance, WFH, IT support, reimbursements, policies, and account questions.${roleLine}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMessageText(text) {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

function appendMessage(chatLog, role, text) {
  const safe = formatMessageText(text);
  chatLog.innerHTML += `<div><strong>${role}:</strong> ${safe}</div>`;
}

function getSuggestionsForRole(role) {
  return [...COMMON_SUGGESTIONS, ...(ROLE_SUGGESTIONS[role] || ROLE_SUGGESTIONS.guest)];
}

function renderSuggestionChips() {
  const chipBox = document.getElementById("chatSuggestions");
  if (!chipBox) return;

  const role = getCurrentUserRole();
  const suggestions = getSuggestionsForRole(role);

  chipBox.innerHTML = suggestions
    .map((item) => `<button type="button" class="chat-chip" data-prompt="${escapeHtml(item)}">${escapeHtml(item)}</button>`)
    .join("");
}

export function refreshChatSuggestions() {
  renderSuggestionChips();
}

function ensureWelcomeMessage(chatLog) {
  if (!chatLog || chatLog.dataset.welcomeShown === "true") return;
  const role = getCurrentUserRole();

  const roleLine =
    role === "admin"
      ? "\n- How do I manage users and roles?"
      : role === "user"
        ? "\n- How do I raise an IT support ticket?"
        : "\n- How do I sign up and verify my email?";

  appendMessage(
    chatLog,
    "AI",
    `Welcome! I can help new employees quickly.\nTry asking:\n- ${COMMON_SUGGESTIONS.join("\n- ")}${roleLine}`
  );

  chatLog.dataset.welcomeShown = "true";
}

export function initChatSuggestions() {
  const chipBox = document.getElementById("chatSuggestions");
  const userInput = document.getElementById("userInput");

  if (!chipBox || !userInput) return;

  renderSuggestionChips();

  chipBox.addEventListener("click", (e) => {
    const target = e.target.closest(".chat-chip");
    if (!target) return;

    const prompt = target.getAttribute("data-prompt") || "";
    userInput.value = prompt;
    sendMessage();
  });
}

export async function sendMessage() {
  const userInput = document.getElementById("userInput");
  const chatLog = document.getElementById("chatLog");
  const token = localStorage.getItem("token");

  if (!userInput || !chatLog) return;
  ensureWelcomeMessage(chatLog);

  const text = userInput.value.trim();
  if (!text) return;

  appendMessage(chatLog, "You", text);
  userInput.value = "";

  try {
    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    const role = data?.role || getCurrentUserRole();
    const reply = data?.reply || getAIResponse(text, role);
    appendMessage(chatLog, "AI", reply);
  } catch (error) {
    appendMessage(chatLog, "AI", getAIResponse(text, getCurrentUserRole()));
  } finally {
    chatLog.scrollTop = chatLog.scrollHeight;
  }
}
