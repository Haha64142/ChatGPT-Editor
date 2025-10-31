import express from "express";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";
import { getResponse } from "./ai.js";

const app = express();
const port = 80;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.post("/api/data", async (req, res) => {
  const data = req.body;
  console.log("Received data:", data);
  const response = await getResponse(data);
  res.json(response);
});

app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log("\nPress Enter to stop the server");
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", () => {
  console.log("Stopping server...");
  server.close(() => {
    console.log("Server stopped");
    process.exit(0);
  });
});
