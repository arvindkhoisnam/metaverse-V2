import express from "express";
import dotenv from "dotenv";
import { route } from "./routes/index";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/v1", route);
app.get("/", (req, res) => {
  res.send("healthy server");
});
app.listen(3000, () => console.log("Listening on port 3000"));
