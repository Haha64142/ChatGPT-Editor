const submitBtn = document.getElementById("submitBtn");
const sendBtn = document.getElementById("sendBtn");
const inputForm = document.getElementById("inputForm");
const exportBtn = document.getElementById("exportBtn");
const clearBtn = document.getElementById("clearBtn");
const selfResponseChk = document.getElementById("selfResponseChk");
const messages = document.getElementById("messages");
const inputText = document.getElementById("inputText");

let selfResponse = false;
let messageArray = [];
let workingIndex = 0;

window.onload = function () {
  try {
    fetch("/wake")
      .then((r) => r.text())
      .then((body) => {
        if (body == "App is awake") {
          submitBtn.disabled = false;
          sendBtn.disabled = false;
        } else {
          alert(body);
        }
      })
      .catch((err) => {
        console.log(err.stack);
        alert(err.stack);
      });
  } catch (err) {
    console.log(err.stack);
    alert(err.stack);
  }
};

inputForm.addEventListener("submit", (e) => {
  e.preventDefault();

  addMessage(inputText.value, "user");
  inputText.value = "";

  fetchResponse();
});
submitBtn.addEventListener("click", fetchResponse);
exportBtn.addEventListener("click", downloadChat);
clearBtn.addEventListener("click", clearMessages);
selfResponseChk.addEventListener("change", (event) => {
  selfResponse = event.target.checked;
});

async function fetchResponse() {
  console.log("Submitting data to /api/data:", messageArray);
  const response = await fetch("/api/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messageArray),
  });

  if (!response.ok) {
    let data = await response.text();
    addErrorMessage(data, "assistant");
    return;
  }

  let data = await response.json();
  addMessage(data.content, "assistant");

  if (selfResponse) {
    let messageArrayTmp = messageArray;
    clearMessages();

    // Swap roles to have the AI talk to itself
    for (let i = 0; i < messageArrayTmp.length; ++i) {
      if (messageArrayTmp[i].role === "user") {
        messageArrayTmp[i].role = "assistant";
      } else if (messageArrayTmp[i].role === "assistant") {
        messageArrayTmp[i].role = "user";
      }

      addMessage(messageArrayTmp[i].content, messageArrayTmp[i].role);
    }
  }
}

function addMessage(content, role) {
  const div = document.createElement("div");
  div.className = "message " + role;

  const index = workingIndex++;
  div.dataset.index = index;

  const span = document.createElement("span");
  span.className = "message-content";
  span.textContent = content;
  div.appendChild(span);

  const buttons = document.createElement("div");
  buttons.className = "message-buttons";

  const copyBtn = document.createElement("button");
  copyBtn.textContent = "Copy";
  copyBtn.onclick = () => navigator.clipboard.writeText(content);

  buttons.appendChild(copyBtn);
  div.appendChild(buttons);

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;

  messageArray.push({ role: role, content: content, index: index });
}

function addErrorMessage(content, role) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");

  const pre = doc.querySelector("pre");

  const div = document.createElement("div");
  div.className = "message " + role + " error";

  if (pre) {
    div.appendChild(pre.cloneNode(true));
  } else {
    div.textContent = "Server Error";
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function clearMessages() {
  for (; messages.childElementCount > 0; ) {
    messages.removeChild(messages.children[0]);
  }

  messageArray = [];
  workingIndex = 0;
}

function downloadChat() {
  const dataStr = JSON.stringify(messageArray, null, 2) + "\n";
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
