export function sendMessage() {
  const text = userInput.value.trim();
  if(!text) return;

  chatLog.innerHTML += `<div>You: ${text}</div>`;

  setTimeout(()=>{
    chatLog.innerHTML += `<div>AI: Demo response</div>`;
  },300);

  userInput.value="";
}