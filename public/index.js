const submitBtn = document.getElementById("submitBtn");
const sendBtn = document.getElementById("sendBtn");
const inputForm = document.getElementById("inputForm");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");
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

    // // For google sites version
    // fetch("https://script.google.com/macros/s/AKfycbxikHPARJFueF3BJiX9IlbyHx3xXDuiVi60I4DzdIESspjwFbpbtXxGbmkJySAGKVFfWA/exec?method=wake")
    //   .then((r) => r.json())
    //   .then((body) => {
    //     if (body.status >= 400) {
    //       alert(body.body)
    //     }
    //
    //     if (body.body == "App is awake") {
    //       submitBtn.disabled = false;
    //       sendBtn.disabled = false;
    //     } else {
    //       alert(body.body);
    //     }
    //   })
    //   .catch((err) => {
    //     console.log(err.stack);
    //     alert(err.stack);
    //   });

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
importBtn.addEventListener("click", () => {
  importFile.click();
});
importFile.addEventListener("change", importChat);
exportBtn.addEventListener("click", downloadChat);
clearBtn.addEventListener("click", clearMessages);
selfResponseChk.addEventListener("change", (event) => {
  selfResponse = event.target.checked;
});

async function fetchResponse() {
  console.log("Submitting data to /api/data:", messageArray);
  let response;
  try {
    response = await fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageArray),
    });

    // // For google sites version
    // response = await fetch(
    //   "https://script.google.com/macros/s/AKfycbxikHPARJFueF3BJiX9IlbyHx3xXDuiVi60I4DzdIESspjwFbpbtXxGbmkJySAGKVFfWA/exec"
    //   + "?method=api%2Fdata"
    //   + "&payload=" + encodeURIComponent(JSON.stringify(messageArray))
    // );

  } catch (err) {
    console.log(err.stack);
    alert(err.stack);
  }

  if (!response.ok) {
    let data = await response.text();
    addErrorMessage(data, "assistant");
    return;
  }

  // // For google sites version
  // if (data.status >= 400) {
  //   addErrorMessage(data.body, "assistant");
  //   return;
  // }

  let data = await response.json();
  // addMessage(JSON.parse(data.body).content, "assistant");
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

function addMessageJSON(message) {
  if (!("content" in message && "role" in message)) {
    alert("content or role key is missing in message:" + message);
    console.error("content or role key is missing in message:" + message);
    return;
  }

  if ("index" in message) {
    addMessage(message.content, message.role, message.index, false);
  } else {
    addMessage(message.content, message.role, undefined, false);
  }
}

function addMessage(content, role, index = undefined, addToMessageArray = true) {
  const div = document.createElement("div");
  div.className = "message " + role;

  let messageIndex;
  if (index === undefined) {
    messageIndex = workingIndex++;
  } else {
    messageIndex = index;
    workingIndex = index + 1;
  }
  div.dataset.index = messageIndex;

  const span = document.createElement("span");
  span.className = "message-content";
  span.textContent = content;
  div.appendChild(span);

  const buttons = document.createElement("div");
  buttons.className = "message-buttons";

  const copyBtn = document.createElement("button");
  copyBtn.textContent = "Copy";
  copyBtn.onclick = () => navigator.clipboard.writeText(content);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = () => deleteMessage(messageIndex);

  buttons.appendChild(copyBtn);
  buttons.appendChild(deleteBtn);
  div.appendChild(buttons);

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;

  if (addToMessageArray) messageArray.push({ role: role, content: content, index: messageIndex });
}

function addErrorMessage(content, role) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");

  const pre = doc.querySelector("pre");

  const div = document.createElement("div");
  div.className = "message " + role + " error";

  const messageContent = document.createElement("div");
  messageContent.className = "message-content";

  if (pre) {
    messageContent.appendChild(pre.cloneNode(true));
  } else {
    messageContent.textContent = "Server Error: " + content;
  }

  div.appendChild(messageContent);

  const buttons = document.createElement("div");
  buttons.className = "message-buttons";

  const copyBtn = document.createElement("button");
  copyBtn.textContent = "Copy";
  copyBtn.onclick = () => navigator.clipboard.writeText(content);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = () => div.remove();

  buttons.appendChild(copyBtn);
  buttons.appendChild(deleteBtn);
  div.appendChild(buttons);

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function deleteMessage(index) {
  for (let i = 0; i < messageArray.length; ++i) {
    if (messageArray[i].index == index) {
      messageArray.splice(i, 1);
    }

    if (messages.children[i].dataset.index == index) {
      messages.removeChild(messages.children[i]);
    }
  }
}

function clearMessages() {
  for (; messages.childElementCount > 0; ) {
    messages.removeChild(messages.children[0]);
  }

  messageArray = [];
  workingIndex = 0;
}

function importChat() {
  new Response(importFile.files[0]).json()
    .then((messages) => {
      clearMessages();
      messageArray = messages;
      for (let i = 0; i < messageArray.length; ++i) {
        addMessageJSON(messageArray[i]);
      }
    }, (err) => {
      alert("Invalid file uploaded");
      console.log("Invalid file uploaded");
    })
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
