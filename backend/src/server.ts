import "dotenv/config";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
import app from "./app.js";

const PORT = process.env["PORT"] || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
