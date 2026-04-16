import "dotenv/config";
import type { Knex } from "knex";

const config: Record<string, Knex.Config> = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env["DB_HOST"] || "localhost",
      port: Number(process.env["DB_PORT"]) || 3306,
      user: process.env["DB_USER"] || "root",
      password: process.env["DB_PASSWORD"] || "",
      database: process.env["DB_NAME"] || "sorvil",
    },
    migrations: {
      directory: "./src/database/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./src/database/seeds",
      extension: "ts",
    },
  },
};

export default config;
