const submitBtn = document.getElementById("submitBtn");
const exportBtn = document.getElementById("exportBtn");
const clearBtn = document.getElementById("clearBtn");
const selfResponseChk = document.getElementById("selfResponseChk");
const chatText = document.getElementById("chatText");

var selfResponse = false;

submitBtn.addEventListener("click", fetchResponse);
exportBtn.addEventListener("click", downloadChat);
clearBtn.addEventListener("click", () => {
  chatText.value = "";
});
selfResponseChk.addEventListener("change", (event) => {
  selfResponse = event.target.checked;
});

async function fetchResponse() {
  console.log("Submitting data to /api/data:", chatText.value);
  const response = await fetch("/api/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: chatText.value,
  });
  let data = await response.json();

  if (selfResponse) {
    // Swap roles to have the AI talk to itself
    for (let i = 0; i < data.length; ++i) {
      if (data[i].role === "user") {
        data[i].role = "assistant";
      } else if (data[i].role === "assistant") {
        data[i].role = "user";
      }
    }
  }

  chatText.value = JSON.stringify(data);
}

function downloadChat() {
  const dataStr = chatText.value;
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "chat_export.json";

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
