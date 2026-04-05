import express from "express";
import cors from "cors";
import indexRoutes from "./index/index.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", indexRoutes);

export default app;
