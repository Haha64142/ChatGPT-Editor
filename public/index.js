const submitBtn = document.getElementById("submitBtn");
const chatText = document.getElementById("chatText");

submitBtn.addEventListener("click", fetchResponse);

async function fetchResponse() {
  console.log("Submitting data to /api/data:", chatText.value);
  const response = await fetch("/api/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: chatText.value,
  });
  const data = await response.json();
  chatText.value = JSON.stringify(data);
}
