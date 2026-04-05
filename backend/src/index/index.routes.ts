import { Router } from "express";
import { handleGetPagina } from "./index.controller.js";

const router = Router();

router.get("/", handleGetPagina);

export default router;
