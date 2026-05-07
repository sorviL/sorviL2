import "dotenv/config";
import app from "./app.js";
import db from "./config/database.js";

const PORT = process.env["PORT"] || 3000;

async function start() {
  try {
    await db.migrate.latest();
    console.log("Migrations executadas com sucesso.");
  } catch (err) {
    console.error("Erro ao executar migrations:", err);
  }

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

start();
