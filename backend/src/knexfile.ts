import "dotenv/config";
import type { Knex } from "knex";

const dbHost = process.env["DB_HOST"] || "localhost";
const dbPort = Number(process.env["DB_PORT"]) || 3306;
const dbUser = process.env["DB_USER"] || process.env["DB_USERNAME"] || "root";
const dbPassword = process.env["DB_PASSWORD"] || "";
const dbName = process.env["DB_NAME"] || process.env["DB_DATABASE"] || "sorvil";
const useSsl = process.env["DB_SSL"] === "true" || /tidbcloud\.com$/i.test(dbHost);

const config: Record<string, Knex.Config> = {
  development: {
    client: "mysql2",
    connection: {
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      ssl: useSsl ? { rejectUnauthorized: true } : undefined,
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
  production: {
    client: "mysql2",
    connection: {
      host: dbHost,
      port: Number(process.env["DB_PORT"]) || 4000,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      ssl: { rejectUnauthorized: true },
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
