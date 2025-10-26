import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getResponse } from "./ai.js";
import { get } from "http";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.post("/api/data", async (req, res) => {
  const data = req.body;
  console.log("Received data:", data);
  const response = await getResponse(data);
  console.log("Sending response:", response);
  res.json(response);
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
