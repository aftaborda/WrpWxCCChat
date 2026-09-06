import "dotenv/config";
import express from "express";
import path from "path";

import { wxccRouter } from "./routes/wxcc.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());

app.use("/wxcc", wxccRouter);

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
