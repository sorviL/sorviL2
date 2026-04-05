import type { Request, Response } from "express";
import { getDadosPagina } from "./index.service.js";

export function handleGetPagina(_req: Request, res: Response) {
  const dados = getDadosPagina();
  res.json(dados);
}
