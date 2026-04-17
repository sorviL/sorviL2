import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("ai_messages", (table) => {
    table.increments("id").primary();
    table
      .integer("conversation_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("ai_conversations")
      .onDelete("CASCADE");
    table.enum("role", ["user", "assistant"]).notNullable();
    table.text("content").notNullable();
    table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("ai_messages");
}
