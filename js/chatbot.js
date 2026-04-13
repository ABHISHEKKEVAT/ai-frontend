import { API } from "./api.js";

export function getAIResponse(text) {
  const q = text.toLowerCase().trim();

  const responses = [
    {
      keywords: ["hello", "hi", "hey"],
      reply: "Hello! How can I help you today?"
    },
    {
      keywords: ["good morning"],
      reply: "Good morning! What would you like to know?"
    },
    {
      keywords: ["good evening"],
      reply: "Good evening! How may I help you today?"
    },
    {
      keywords: ["leave", "vacation", "holiday"],
      reply: "You can request leave through the HR portal."
    },
    {
      keywords: ["benefits", "salary", "insurance"],
      reply: "You can view your benefits in the HR system."
    },
    {
      keywords: ["onboarding", "training", "joining"],
      reply: "Onboarding includes training, setup, and team introductions."
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

  for (const item of responses) {
    for (const word of item.keywords) {
      if (q.includes(word)) {
        return item.reply;
      }
    }
  }

  return "This is a demo response showing how AI can answer internal questions instantly.";
}

export async function sendMessage() {
  const userInput = document.getElementById("userInput");
  const chatLog = document.getElementById("chatLog");

  if (!userInput || !chatLog) return;

  const text = userInput.value.trim();
  if (!text) return;

  chatLog.innerHTML += `<div><strong>You:</strong> ${text}</div>`;
  userInput.value = "";

  try {
    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    const reply = data?.reply || getAIResponse(text);
    chatLog.innerHTML += `<div><strong>AI:</strong> ${reply}</div>`;
  } catch (error) {
    chatLog.innerHTML += `<div><strong>AI:</strong> ${getAIResponse(text)}</div>`;
  } finally {
    chatLog.scrollTop = chatLog.scrollHeight;
  }
}
