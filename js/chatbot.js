export function getAIResponse(text) {
  const q = text.toLowerCase().trim();

  if (q === "hello") return "Hello! How can I help you today?";
  if (q === "hi") return "Hi! What would you like to know?";
  if (q === "good morning") return "Good morning! What would you like to know?";
  if (q === "good evening") return "Good evening! How may I help you today?";
  if (q === "hey") return "Hey! How can I assist you?";
  if (q.includes("leave")) return "You can request leave through the HR portal.";
  if (q.includes("benefits")) return "You can view your benefits in the HR system.";
  if (q.includes("onboarding")) return "Onboarding includes training, setup, and team introductions.";
  if (q.includes("abhishek")) return "Hello sir, how may I help you?";
  if (q.includes("pratik")) return "Hello Pratik, do you want to join my company?";

  return "This is a demo response showing how AI can answer internal questions instantly.";
}

export function sendMessage() {
  const userInput = document.getElementById("userInput");
  const chatLog = document.getElementById("chatLog");

  if (!userInput || !chatLog) return;

  const text = userInput.value.trim();
  if (!text) return;

  chatLog.innerHTML += `<div><strong>You:</strong> ${text}</div>`;

  setTimeout(() => {
    chatLog.innerHTML += `<div><strong>AI:</strong> ${getAIResponse(text)}</div>`;
    chatLog.scrollTop = chatLog.scrollHeight;
  }, 300);

  userInput.value = "";
}
